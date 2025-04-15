import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    birthdate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("user", userSchema);

export default User;
