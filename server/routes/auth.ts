import express from 'express';
import { Company } from '../models/Company.js';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/managers', async (req, res) => {
  try {
    const managers = await User.find({ roles: 'Manager' }).select('name email');
    res.json(managers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register-company', async (req, res) => {
  try {
    const { name, domain, defaultCurrency, adminName, adminEmail, firebaseUid } = req.body;
    const existing = await Company.findOne({ domain });
    if (existing) {
      res.status(400).json({ error: 'Domain already registered' });
      return;
    }
    
    const company = await Company.create({ name, domain, defaultCurrency });
    
    // Create Admin User
    const adminUser = await User.create({
      firebaseUid,
      name: adminName,
      email: adminEmail,
      companyId: company._id,
      roles: ['Admin', 'Employee']
    });

    res.status(201).json({ company, adminUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { firebaseUid, name, email, roles, managerId } = req.body;
    
    const domain = email.split('@')[1];
    const company = await Company.findOne({ domain });
    if (!company) {
      res.status(400).json({ error: 'Company domain not registered. Please register company first.' });
      return;
    }
    
    // Check if user already exists (e.g., from seed data)
    let user = await User.findOne({ email });
    if (user) {
      // Link Firebase UID to existing seeded user
      user.firebaseUid = firebaseUid;
      await user.save();
    } else {
      user = await User.create({
        firebaseUid,
        name,
        email,
        companyId: company._id,
        roles: roles || ['Employee'],
        managerId: managerId || null
      });
    }
    
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json((req as any).user);
});

export default router;
