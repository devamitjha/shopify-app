import mongoose from "mongoose";

export const connectDB = async () => {

  try {

    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing in environment variables");
    }

    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected Successfully");

  } catch (error) {

    console.log("❌ MongoDB Connection Failed");
    console.error(error);

  }

};