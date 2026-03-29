import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (mongoUri) {
      await mongoose.connect(mongoUri);
      console.log('Connected to MongoDB Atlas / Local');
    } else {
      console.error('MONGODB_URI environment variable is not set. Exiting.');
      process.exit(1);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
