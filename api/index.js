/* eslint-disable no-undef */
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import dbConnect from "./utils/dbConnect.js";
const app = express();
const PORT = process.env.PORT || 3000;
import authRoute from "./routes/auth.js";
import adminRoute from "./routes/admin.js";
import verifyLogin from "./middleware/verifyLogin.js";

app.use(bodyParser.json());
app.use(cookieParser());
app.use(verifyLogin);
app.use("/api/auth", authRoute);
app.use("/api/ADMIN", adminRoute);

app.get("/", (req, res) => {
  try {
    res.status(200).json({ resStatus: true, message: "Welcome to EMS" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

app.all(/(.*)/, (req, res) => {
  try {
    res.status(404).json({ resStatus: false, error: "Route not found" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.clear();
  if (dbConnect()) {
    console.log("Connected to DB successfully");
  } else {
    console.log("DB connection failed");
  }
  console.log(`Server is running on http://localhost:${PORT}`);
});
