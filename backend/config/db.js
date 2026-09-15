import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/stock_management";
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected`);
  } catch (error) {
    console.log(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;