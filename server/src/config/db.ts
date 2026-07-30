import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
  });

  console.log('MongoDB connected successfully');
};
