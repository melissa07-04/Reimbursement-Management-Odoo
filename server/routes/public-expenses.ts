import express from 'express';
import { Expense } from '../models/Expense.js';

const router = express.Router();

// Get all expenses for the public finance view
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Publicly approve/reject the current stage
router.post('/:id/review', async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const expense = await Expense.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const stage = expense.approvalFlow[expense.currentStageIndex];
    if (!stage) {
      return res.status(400).json({ error: 'No pending approvals' });
    }
    
    // Add anonymous/public approval
    stage.approvals.push({
      userId: null as any,
      status,
      comment: 'Public Finance Team',
      date: new Date()
    });
    
    if (status === 'Rejected') {
      stage.status = 'Rejected';
      expense.status = 'Rejected';
    } else {
      stage.status = 'Approved';
      expense.currentStageIndex += 1;
      
      if (expense.currentStageIndex >= expense.approvalFlow.length) {
        expense.status = 'Approved';
      } else {
        expense.status = `Pending ${expense.approvalFlow[expense.currentStageIndex].role}` as any;
      }
    }
    
    await expense.save();
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
