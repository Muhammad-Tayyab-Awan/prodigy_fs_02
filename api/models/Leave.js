import mongoose, { Schema } from "mongoose";

const leaveSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: "attendance",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "rejected", "approved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Leave = mongoose.model("leave", leaveSchema);

export default Leave;
