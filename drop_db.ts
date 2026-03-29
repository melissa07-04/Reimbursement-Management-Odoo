import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.log('No MONGODB_URI found. Assuming in-memory database, which is ephemeral. Exiting.');
  process.exit(0);
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped');
  process.exit(0);
}).catch(err => {
  console.error('Failed to drop database:', err);
  process.exit(1);
});
