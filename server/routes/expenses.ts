import express from 'express';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Submit Expense
router.post('/', async (req, res) => {
  try {
    const user = (req as any).user;
    const { amount, currency, convertedAmount, description, date, receiptFile } = req.body;
    
    // Fraud Detection: Check for duplicate
    const duplicate = await Expense.findOne({
      userId: user._id,
      amount,
      date: new Date(date)
    });
    
    if (duplicate) {
      res.status(400).json({ error: 'Possible duplicate expense detected (same amount and date).' });
      return;
    }

    // Determine Approval Flow
    const approvalFlow = [];
    
    // 1. Manager Stage
    if (user.managerId) {
      let managers = [user.managerId];
      let requiredPercentage = 100;
      
      if (convertedAmount > 20000) {
        const allManagers = await User.find({ companyId: user.companyId, roles: 'Manager' }).limit(3);
        if (allManagers.length > 0) {
          managers = allManagers.map(m => m._id);
          requiredPercentage = 65;
        }
      }
      
      approvalFlow.push({
        role: 'Manager',
        users: managers,
        approvals: [],
        requiredPercentage,
        status: 'Pending'
      });
    }

    // 2. Finance Stage
    const financeUsers = await User.find({ companyId: user.companyId, roles: 'Finance' });
    if (financeUsers.length > 0) {
      approvalFlow.push({
        role: 'Finance',
        users: financeUsers.map(f => f._id),
        approvals: [],
        requiredPercentage: 100, // Any 1 finance can approve
        status: 'Pending'
      });
    }

    // 3. Director Stage (Only if > 50000)
    if (convertedAmount > 50000) {
      const directors = await User.find({ companyId: user.companyId, roles: 'Director' });
      if (directors.length > 0) {
        approvalFlow.push({
          role: 'Director',
          users: directors.map(d => d._id),
          approvals: [],
          requiredPercentage: 100,
          status: 'Pending'
        });
      }
    }

    const expense = await Expense.create({
      userId: user._id,
      companyId: user.companyId,
      amount,
      currency,
      convertedAmount,
      description,
      date,
      receiptFile,
      status: approvalFlow.length > 0 ? `Pending ${approvalFlow[0].role}` : 'Approved',
      approvalFlow,
      currentStageIndex: 0
    });

    res.status(201).json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Expenses (Contextual based on role)
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    const { type } = req.query; // 'my' or 'approvals'
    
    if (type === 'my') {
      const expenses = await Expense.find({ userId: user._id }).sort({ createdAt: -1 });
      res.json(expenses);
      return;
    } 
    
    if (type === 'approvals') {
      // Find expenses where current stage includes this user
      const expenses = await Expense.find({
        companyId: user.companyId,
        status: { $nin: ['Approved', 'Rejected', 'Draft'] }
      }).populate('userId', 'name email');
      
      // Filter in memory for simplicity: where user is in the current stage's users array
      const pendingForMe = expenses.filter(exp => {
        const stage = exp.approvalFlow[exp.currentStageIndex];
        if (!stage) return false;
        // Check if user is in the approvers list and hasn't approved yet
        const isApprover = stage.users.some(u => u.toString() === user._id.toString());
        const hasApproved = stage.approvals.some(a => a.userId.toString() === user._id.toString());
        return isApprover && !hasApproved;
      });
      
      res.json(pendingForMe);
      return;
    }
    
    // Admin/All view
    const all = await Expense.find({ companyId: user.companyId }).populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(all);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject
router.post('/:id/review', async (req, res) => {
  try {
    const user = (req as any).user;
    const { status, comment } = req.body; // 'Approved' or 'Rejected'
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    
    const stage = expense.approvalFlow[expense.currentStageIndex];
    if (!stage) {
      res.status(400).json({ error: 'No pending approvals' });
      return;
    }
    
    // Add approval
    stage.approvals.push({
      userId: user._id,
      status,
      comment,
      date: new Date()
    });
    
    if (status === 'Rejected') {
      stage.status = 'Rejected';
      expense.status = 'Rejected';
    } else {
      // Check if required percentage is met
      const approvedCount = stage.approvals.filter(a => a.status === 'Approved').length;
      const percentage = (approvedCount / stage.users.length) * 100;
      
      if (percentage >= stage.requiredPercentage) {
        stage.status = 'Approved';
        expense.currentStageIndex += 1;
        
        if (expense.currentStageIndex >= expense.approvalFlow.length) {
          expense.status = 'Approved';
        } else {
          expense.status = `Pending ${expense.approvalFlow[expense.currentStageIndex].role}` as any;
        }
      }
    }
    
    await expense.save();
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
