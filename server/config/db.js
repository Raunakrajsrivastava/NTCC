import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/architecture_advisor', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${process.env.MONGO_URI || 'mongodb://localhost:27017'}: ${error.message}`);
    console.warn('[MongoDB Warning] Server will continue running, but database features require a running MongoDB instance.');
    return false;
  }
};
