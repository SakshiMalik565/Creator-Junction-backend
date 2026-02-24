import "dotenv/config";
import connectDB from "./config/db.js";
import Plan from "./models/Plan.js";
await connectDB();
await Plan.deleteMany({});
await Plan.insertMany([
  {
    name: "Basic Plan",
    price: 99,
    tokens: 100
  },
  {
    name: "Standard Plan",
    price: 199,
    tokens: 250,
    bonusTokens: 50
  },
  {
    name: "Premium Plan",
    price: 499,
    tokens: 700,
    bonusTokens: 150
  }
]);
console.log("Plans seeded successfully");
process.exit();

