import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    amount:Number,
    tokens:Number,
    razorpay_orderId: String,
    razorpay_paymentId: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: "pending",
    },
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);