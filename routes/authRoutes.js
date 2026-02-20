import express from "express";
import { signup, login, logout, sendOtpController, verifyOtpController } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});
router.post("/logout", logout);
router.post("/send-otp", sendOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;