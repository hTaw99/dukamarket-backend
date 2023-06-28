import { Router } from "express";
import {
  login,
  logout,
  register,
  refresh,
  resetPassword,
  forgotPassword,
  verifyOtp,
} from "../controllers/auth.js";
import loginLimiter from "../middlewares/loginLimiter.js";

const router = Router();

router.post("/register", loginLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/forgotPassword", forgotPassword);
router.post("/otpVerification", verifyOtp);
router.patch("/resetPassword/:resetToken", resetPassword);
router.get("/refresh", refresh);
router.get("/logout", logout);


export default router;
