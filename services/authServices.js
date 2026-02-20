import User from "../models/User.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

export const registerUser = async ({ name, email, password }) => {

  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  const token = generateToken(user._id);

  return {
    user,
    token
  };
};

export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user._id);

  return {
    user,
    token
  };
};