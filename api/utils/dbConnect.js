/* eslint-disable no-undef */
import mongoose from "mongoose";
const DB_URI = process.env.DB_URI;

const dbConnect = async () => {
  try {
    await mongoose.connect(dbUri);
    return true;
  } catch (error) {
    return error;
  }
};

export default dbConnect;
