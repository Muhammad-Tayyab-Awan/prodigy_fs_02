/* eslint-disable no-undef */
import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET;
import User from "../models/Users.js";

const verifyLogin = (req, res, next) => {
  try {
    const { cookies } = req;
    const authToken = cookies["ems_auth_token"];
    if (!authToken) {
      req.userStatus = { loggedIn: false };
      return next();
    }
    jwt.verify(authToken, jwtSecret, async (err, decodedToken) => {
      if (err) {
        req.userStatus = { loggedIn: false };
        return next();
      }
      const { userId } = decodedToken;
      const userExist = await User.findById(userId);
      if (!(userExist && userExist.emailVerified && userExist.userVerified)) {
        req.userStatus = { loggedIn: false };
        return next();
      }
      req.userStatus = {
        loggedIn: true,
        userId: userId,
        role: userExist.role,
        username: userExist.username,
        email: userExist.email,
      };
      return next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
};
export default verifyLogin;
