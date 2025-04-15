/* eslint-disable no-undef */
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());

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
  console.log(`Server is running on http://localhost:${PORT}`);
});
