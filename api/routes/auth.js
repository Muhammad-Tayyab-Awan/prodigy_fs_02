/* eslint-disable no-undef */
import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import { body, param, validationResult } from "express-validator";
import User from "../models/Users.js";
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;
import mailSender from "../utils/mailSender.js";
const apiURI = process.env.API_URI;

router.post(
  "/register",
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
      if (userStatus.loggedIn)
        return res.status(404).json({
          resStatus: false,
          error: "Logout first to register new account",
        });
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(404).json({
          resStatus: false,
          error: result.errors,
        });
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
      await User.create({ ...req.body });
      res.status(200).json({
        resStatus: true,
        message: "Your account registered successfully",
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

router.post(
  "/login",
  [
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
  ],
  async (req, res) => {
    try {
      const { userStatus } = req;
      if (userStatus.loggedIn)
        return res
          .status(404)
          .json({ resStatus: false, error: "You are already logged in" });
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(404).json({ resStatus: false, error: result.errors });
      const { email, password } = req.body;
      const userExist = await User.findOne({ email: email });
      if (!userExist)
        return res.status(404).json({
          resStatus: false,
          error: "Please provide correct credentials",
        });
      const passwordMatch = await bcrypt.compare(password, userExist.password);
      if (!passwordMatch)
        return res.status(404).json({
          resStatus: false,
          error: "Please provide correct credentials",
        });
      if (userExist.verified) {
        const authToken = jwt.sign(
          { userId: userExist.id.toString() },
          jwtSecret,
        );
        res.cookie("ems_auth_token", authToken, {
          secure: true,
          maxAge: 604800000,
        });
        return res.status(200).json({
          resStatus: true,
          message: `Welcome back ${userExist.name} to EMS`,
        });
      } else {
        const verificationToken = jwt.sign(
          { userId: userExist.id.toString() },
          jwtSecret,
        );
        const htmlMessage = `Dear ${userExist.username}!<br/><b>Please verify your account</b><br/><a href="${apiURI}/api/auth/verify/${verificationToken}">Verify Now</a>`;
        mailSender.sendMail(
          {
            to: userExist.email,
            sender: "EMS by Tayyab Awan",
            subject: "Account Verification",
            html: htmlMessage,
          },
          (err) => {
            if (err) {
              return res.status(400).json({
                resStatus: false,
                error: err.message,
              });
            }
            res.status(200).json({
              resStatus: false,
              error:
                "We have sent you a verification email please check your mailbox to verify and login",
            });
          },
        );
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message,
      });
    }
  },
);

router.get(
  "/verify/:verificationToken",
  param("verificationToken").isJWT(),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (!result.isEmpty())
        return res.status(404).json({ resStatus: false, error: result.errors });
      const { verificationToken } = req.params;
      jwt.verify(verificationToken, jwtSecret, async (err, decodedToken) => {
        if (err)
          return res
            .status(404)
            .json({ resStatus: false, error: "Invalid request" });
        const { userId } = decodedToken;
        const userExist = await User.findById(userId);
        if (!userExist)
          return res
            .status(404)
            .json({ resStatus: false, error: "Invalid request" });
        if (userExist.verified)
          return res
            .status(404)
            .json({ resStatus: false, error: "Your account already verified" });
        userExist.verified = true;
        await userExist.save();
        const authToken = jwt.sign(
          { userId: userExist.id.toString() },
          jwtSecret,
        );
        res.cookie("ems_auth_token", authToken, {
          secure: true,
          maxAge: 604800000,
        });
        return res.status(200).json({
          resStatus: true,
          message: `Welcome to EMS! ${userExist.name}! Your account verified successfully`,
        });
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

router.get("/logout", async (req, res) => {
  try {
    if (!req.userStatus.loggedIn)
      return res.status(404).json({
        resStatus: false,
        error: "You are not logged into any account",
      });
    res.clearCookie("ems_auth_token");
    res
      .status(200)
      .json({ resStatus: true, message: "You are successfully logged out" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

router.get("/delete", async (req, res) => {
  try {
    const { userStatus } = req;
    if (!userStatus.loggedIn)
      return res.status(404).json({
        resStatus: false,
        error: "You are not logged into any account",
      });
    const { userId } = userStatus;
    await User.findByIdAndDelete(userId);
    res.clearCookie("ems_auth_token");
    res
      .status(200)
      .json({ resStatus: true, message: "Your account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

export default router;
