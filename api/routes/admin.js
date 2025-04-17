import express from "express";
import { body, param, validationResult } from "express-validator";
const router = express.Router();
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";

router.post(
  "/add-admin",
  [
    body("name")
      .isString()
      .matches(/[A-Za-z ]{6,25}$/),
    body("username")
      .matches(/^(?=.*[a-z])(?=.*\d)[a-z\d]+$/)
      .isLength({ min: 6, max: 20 }),
    body("email").isEmail(),
    body("password")
      .isStrongPassword({
        minLowercase: 3,
        minUppercase: 2,
        minNumbers: 2,
        minSymbols: 1,
        minLength: 8,
      })
      .isLength({ max: 18 }),
    body("gender").isIn(["male", "female"]),
    body("birthdate").isISO8601({ strict: true, strictSeparator: true }),
  ],
  async (req, res) => {
    try {
      const { userStatus } = req;
      if (!(userStatus.loggedIn && userStatus.role === "admin"))
        return res.status(404).json({
          resStatus: false,
          error: "Please login to your admin account",
        });
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(404).json({ resStatus: false, error: result.errors });
      for (const element in req.body) {
        if (
          element !== "name" &&
          element !== "username" &&
          element !== "email" &&
          element !== "password" &&
          element !== "gender" &&
          element !== "birthdate"
        )
          delete req.body[element];
      }
      const emailExist = await User.findOne({ email: req.body.email });
      const usernameExist = await User.findOne({
        username: req.body.username,
      });
      if (emailExist && usernameExist)
        return res.status(404).json({
          resStatus: false,
          error: "User with that email and username already exists",
        });
      if (emailExist || usernameExist)
        return res.status(404).json({
          resStatus: false,
          error: `User with that ${emailExist ? "email" : "username"} already exists`,
        });
      const hashedPassword = bcrypt.hashSync(
        req.body.password,
        await bcrypt.genSalt(10),
      );
      req.body.password = hashedPassword;
      req.body.role = "admin";
      req.body.userVerified = true;
      await User.create({ ...req.body });
      res.status(200).json({
        resStatus: true,
        message: "You have successfully registered new admin",
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

router.get("/users", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const Users = await User.find({ role: "user" }).select("-password");
    res.status(200).json({ resStatus: true, Users });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/admins", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const Admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ resStatus: true, Admins });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/verify/:userId", param("userId").isMongoId(), async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(404).json({ resStatus: false, error: result.errors });
    const { userId } = req.params;
    const userExist = await User.findOne({ _id: userId, role: "user" });
    if (!userExist)
      return res.status(404).json({
        resStatus: false,
        error: "Invalid request no user exist with that id",
      });
    if (userExist.userVerified)
      return res.status(404).json({
        resStatus: false,
        error: "Invalid request user account already verified",
      });
    userExist.userVerified = true;
    await userExist.save();
    res
      .status(200)
      .json({ resStatus: true, message: "User account verified successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/delete/:userId", param("userId").isMongoId(), async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const result = validationResult(req);
    if (!result.isEmpty())
      return res.status(404).json({ resStatus: false, error: result.errors });
    const { userId } = req.params;
    const userExist = await User.findById(userId);
    if (!userExist)
      return res.status(404).json({
        resStatus: false,
        error: "Invalid request no user exist with that id",
      });
    if (userExist.role === "admin") {
      let adminsCount = await User.find({ role: "admin" });
      adminsCount = adminsCount.length;
      if (adminsCount === 1)
        return res.status(404).json({
          resStatus: false,
          error:
            "You are the only admin so you can't delete your account in order to do that please add another admin",
        });
      if (userExist.id.toString() === userStatus.userId)
        res.clearCookie("ems_auth_token");
    }
    await Attendance.deleteMany({ employeeId: userId });
    await Leave.deleteMany({ employeeId: userId });
    await User.findByIdAndDelete(userId);
    res
      .status(200)
      .json({ resStatus: true, message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/leaves", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const allLeaves = await Leave.find().populate(
      "attendanceId",
      "-employeeId",
      "attendance",
    );
    res.status(200).json({ resStatus: true, allLeaves });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get(
  "/leaves/:leaveId/:submitStatus",
  [
    param("leaveId").isMongoId(),
    param("submitStatus").isIn(["reject", "approve"]),
  ],
  async (req, res) => {
    try {
      const { userStatus } = req;
      if (!(userStatus.loggedIn && userStatus.role === "admin"))
        return res.status(404).json({
          resStatus: false,
          error: "Please login to your admin account",
        });
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(400).json({ resStatus: false, error: result.errors });
      const { leaveId, submitStatus } = req.params;
      const leaveExist = await Leave.findById(leaveId);
      if (!leaveExist)
        return res
          .status(404)
          .json({ resStatus: false, error: "No leave found with that id" });
      if (leaveExist.status !== "pending")
        return res.status(400).json({
          resStatus: false,
          error: `This leave is already ${leaveExist.status}`,
        });
      leaveExist.status = submitStatus === "reject" ? "rejected" : "approved";
      if (submitStatus === "reject") {
        await Attendance.findByIdAndUpdate(leaveExist.attendanceId, {
          status: "absent",
        });
      }
      await leaveExist.save();
      res.status(200).json({
        resStatus: true,
        message: `Leave request ${submitStatus === "reject" ? "rejected" : "approved"}`,
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

router.get("/attendances", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!(userStatus.loggedIn && userStatus.role === "admin"))
      return res.status(404).json({
        resStatus: false,
        error: "Please login to your admin account",
      });
    const allAttendances = await Attendance.find();
    res.status(200).json({ resStatus: true, allAttendances });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

export default router;
