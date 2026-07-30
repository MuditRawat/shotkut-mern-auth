import mongoose from 'mongoose';

/**
 * Establishes connection to MongoDB Atlas database
 */
export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.warn('⚠️ MONGODB_URI is not defined in environment variables. Connection skipped.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${(error as Error).message}`);
  }
};
