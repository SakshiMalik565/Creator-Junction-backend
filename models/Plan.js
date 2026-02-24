import mongoose from "mongoose";
const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true, 
    },
    tokens: {
        type: Number,
        required: true,
    },
    bonusTokens: {  
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
export default mongoose.model('Plan', planSchema);