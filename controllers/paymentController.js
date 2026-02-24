import Plan from '../models/Plan.js';
import Order from '../models/Order.js';
import razorpay from '../config/razorpay.js';
export const createOrder = async (req, res) => {
    const { planId } = req.body;
   const plan = await Plan.findById(planId);
    if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
    }
    const razorpayOrder = await razorpay.orders.create({
        amount: plan.price * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
    });
    await Order.create({
        user: req.user._id,
        plan: plan._id,
        razorpay_orderId: razorpayOrder.id,
        amount: plan.price,
        tokens: plan.tokens + plan.bonusTokens,
    });
    res.json({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID
    });
};