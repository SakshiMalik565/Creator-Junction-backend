
import express from "express";
import "dotenv/config"
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import assetRoutes from "./routes/assetRoute.js";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log("Server running on port", port);
});