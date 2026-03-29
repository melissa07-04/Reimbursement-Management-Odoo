import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { User } from '../models/User.js';
import mongoose from 'mongoose';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'glass-sight-484003-u9' });
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    // For local dev/demo, if the token is just a UID (e.g. from seed data), we allow it.
    // Otherwise, we verify the real Firebase JWT.
    let uid = token;
    if (token.length > 100) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      uid = decodedToken.uid;
    }
    
    // Find user by firebaseUid or _id (if uid is a valid ObjectId)
    const query: any = { firebaseUid: uid };
    if (mongoose.Types.ObjectId.isValid(uid)) {
      query.$or = [{ firebaseUid: uid }, { _id: uid }];
      delete query.firebaseUid;
    }

    const user = await User.findOne(query).populate('companyId');
    
    if (!user) {
      res.status(401).json({ error: 'User not found in DB' });
      return;
    }
    
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
