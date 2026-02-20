import { registerUser, loginUser } from "../services/authServices.js";
import generateToken from "../utils/generateToken.js";
import { saveOtp } from "../services/otpServices.js";
import { sendEmail } from "../sendEmail.js";
import { verifyOtpService } from "../services/otpServices.js";
import { generateOtp } from "../services/otpServices.js";
export const signup = async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({ message: "Logged out" });
};

export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    const otp =  generateOtp();
    console.log("otp",otp);
    await saveOtp(email, otp);
    console.log()
       await sendEmail(
      email, // 👈 THIS IS THE RECEIVER
      "Your OTP Code",
      `Your OTP is ${otp}. It expires in 5 minutes.`
    );


    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    await verifyOtpService(email, otp);

    const { user, token } = await registerUser({
      name,
      email,
      password
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax"
    });

    res.status(201).json(user);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};