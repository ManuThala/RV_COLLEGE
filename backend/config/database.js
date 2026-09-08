import mongoose from "mongoose";

export const connectDatabase = async () => {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    console.warn(
      "MONGODB_URI is not configured. Running without database connection.",
    );
    return false;
  }

  try {
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    return false;
  }
};

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
