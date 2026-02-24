import express from "express";
import { createOrder} from "../controllers/paymentController.js";
import protect from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/create-order", protect, createOrder);
export default router;

