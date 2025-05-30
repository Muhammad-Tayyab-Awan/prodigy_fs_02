/* eslint-disable no-undef */
import express from "express";
const router = express.Router();
const startingHour = process.env.START_TIME;
const endingHour = process.env.END_TIME;
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
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

router.get("/", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "user"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your account to mark your attendance",
      });
    const currTime = new Date();
    const attendanceMarked = await Attendance.findOne({
      employeeId: userStatus.userId,
      markedOn: currTime.toLocaleString().split(",")[0],
    });
    if (attendanceMarked)
      return res.status(400).json({
        resStatus: true,
        error: `You are ${attendanceMarked.status === "leave" ? "on leave" : attendanceMarked.status} today`,
      });
    if (currTime.getHours() <= endingHour && currTime.getHours() > startingHour)
      return res.json({
        resStatus: false,
        error: "Please mark your today's attendance",
      });
    if (currTime.getHours() < startingHour)
      return res.status(404).json({
        resStatus: false,
        error: "Please wait for start time to mark your attendance",
      });
    if (currTime.getHours() > endingHour)
      return res.status(404).json({
        resStatus: false,
        error: "You can't mark your attendance out of time",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/leave", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "user"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your account to mark your attendance",
      });
    const currTime = new Date();
    const attendanceMarked = await Attendance.findOne({
      employeeId: userStatus.userId,
      markedOn: currTime.toLocaleString().split(",")[0],
    });
    if (attendanceMarked)
      return res.status(400).json({
        resStatus: false,
        error: "Your attendance marked already so you can't submit your leave",
      });
    if (currTime.getHours() < startingHour)
      return res.status(404).json({
        resStatus: false,
        error: "Please wait for start time to submit your leave",
      });
    if (currTime.getHours() > endingHour)
      return res.status(404).json({
        resStatus: false,
        error: "You are not allowed to submit your attendance out of time",
      });
    const newAttendance = await Attendance.create({
      employeeId: userStatus.userId,
      markedOn: currTime.toLocaleString().split(",")[0],
      status: "leave",
    });
    await Leave.create({
      employeeId: userStatus.userId,
      attendanceId: newAttendance.id,
    });
    res.status(200).json({
      resStatus: true,
      message: "Your leave is submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/total", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "user"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your account to mark your attendance",
      });
    const userAttendance = await Attendance.find({
      employeeId: userStatus.userId,
    });
    res.status(200).json({ resStatus: true, userAttendance });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

export default router;
