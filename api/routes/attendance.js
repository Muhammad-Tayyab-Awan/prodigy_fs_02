/* eslint-disable no-undef */
import express from "express";
const router = express.Router();
const startingHour = process.env.START_TIME;
const endingHour = process.env.END_TIME;
import Attendance from "../models/Attendance.js";
import { body, validationResult } from "express-validator";

router.post(
  "/",
  body("status").isIn(["absent", "present"]),
  async (req, res) => {
    try {
      const { userStatus } = req;
      if (!(userStatus.loggedIn && userStatus.role === "user"))
        return res.status(404).json({
          resStatus: false,
          error: "Please login to your account to mark your attendance",
        });
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(404).json({ resStatus: false, error: result.errors });
      const currTime = new Date();
      const attendanceMarked = await Attendance.findOne({
        employeeId: userStatus.userId,
        markedOn: currTime.toLocaleString().split(",")[0],
      });
      if (attendanceMarked)
        return res
          .status(400)
          .json({ resStatus: false, error: "Your attendance marked already" });
      if (currTime.getHours() < startingHour)
        return res.status(404).json({
          resStatus: false,
          error: "Please wait for start time to mark your attendance",
        });
      if (currTime.getHours() > endingHour)
        return res.status(404).json({
          resStatus: false,
          error: "You are not allowed to mark your attendance out of time",
        });
      for (const element in req.body) {
        if (element !== "status") delete req.body[element];
      }
      req.body.employeeId = userStatus.userId;
      req.body.markedOn = currTime.toLocaleString().split(",")[0];
      await Attendance.create(req.body);
      res.status(200).json({
        resStatus: true,
        message: "Your today's attendance marked successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message,
      });
    }
  },
);

export default router;
