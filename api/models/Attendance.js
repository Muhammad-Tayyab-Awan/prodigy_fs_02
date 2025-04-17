import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    markedOn: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["leave", "present", "absent"],
    },
  },
  { timestamps: true },
);

const Attendance = mongoose.model("attendance", attendanceSchema);

export default Attendance;
