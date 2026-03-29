import { Company } from './models/Company.js';
import { User } from './models/User.js';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'glass-sight-484003-u9' });
}

async function getOrCreateFirebaseUser(email: string, name: string) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    // Update password to ensure we can log in with it
    await admin.auth().updateUser(userRecord.uid, { password: 'password123' });
    return userRecord.uid;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      const userRecord = await admin.auth().createUser({
        email,
        password: 'password123',
        displayName: name,
      });
      return userRecord.uid;
    }
    throw error;
  }
}

export const seedDatabase = async () => {
  const companyCount = await Company.countDocuments();
  if (companyCount > 0) return;

  console.log('Seeding database and Firebase Auth...');

  // Create Company
  const company = await Company.create({
    name: 'Acme Corp',
    domain: 'acme.com',
    defaultCurrency: 'INR'
  });

  // 👑 Admin
  const adminUid = await getOrCreateFirebaseUser('admin@acme.com', 'Admin User');
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@acme.com',
    firebaseUid: adminUid,
    companyId: company._id,
    roles: ['Admin']
  });

  // 🎯 Directors
  const dir1Uid = await getOrCreateFirebaseUser('director1@acme.com', 'Director One');
  const director1 = await User.create({
    name: 'Director One',
    email: 'director1@acme.com',
    firebaseUid: dir1Uid,
    companyId: company._id,
    roles: ['Director', 'Employee'],
    managerId: adminUser._id
  });

  const dir2Uid = await getOrCreateFirebaseUser('director2@acme.com', 'Director Two');
  const director2 = await User.create({
    name: 'Director Two',
    email: 'director2@acme.com',
    firebaseUid: dir2Uid,
    companyId: company._id,
    roles: ['Director', 'Employee'],
    managerId: adminUser._id
  });

  // 🧑💼 Managers (4)
  const managers = [];

  for (let i = 1; i <= 4; i++) {
    const email = `manager${i}@acme.com`;
    const name = `Manager ${i}`;
    const uid = await getOrCreateFirebaseUser(email, name);
    const manager = await User.create({
      name,
      email,
      firebaseUid: uid,
      companyId: company._id,
      roles: ['Manager', 'Employee'],
      managerId: i % 2 === 0 ? director1._id : director2._id
    });

    managers.push(manager);
  }

  // 👨💻 Employees (18)
  for (let i = 1; i <= 18; i++) {
    const manager = managers[i % managers.length];
    const email = `employee${i}@acme.com`;
    const name = `Employee ${i}`;
    const uid = await getOrCreateFirebaseUser(email, name);

    const employee = await User.create({
      name,
      email,
      firebaseUid: uid,
      companyId: company._id,
      roles: ['Employee'],
      managerId: manager._id
    });

    // Add to manager's subordinates
    await User.findByIdAndUpdate(manager._id, {
      $push: { subordinates: employee._id }
    });
  }

  // Add managers to directors' subordinates
  for (let i = 0; i < managers.length; i++) {
    const director = i % 2 === 0 ? director1 : director2;

    await User.findByIdAndUpdate(director._id, {
      $push: { subordinates: managers[i]._id }
    });
  }

  console.log('Sample database created with 25 users in MongoDB and Firebase Auth.');
};
