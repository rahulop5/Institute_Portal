import express from "express";
import {
    authMiddleware,
    changePassword,
    handleLogin,
    getProfile,
    // userDetails,
    updateName,
    forgotPassword,
    verifyOtp,
    resetPassword,
} from "../controllers/authController.js";
import { loginLimiter, otpLimiter } from "../utils/rateLimits.js";

const router=express.Router();

router.post("/login", loginLimiter, handleLogin);
router.post("/changepassword", authMiddleware,  changePassword);
router.get("/profile", authMiddleware, getProfile);
router.post("/updateName", authMiddleware, updateName);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/verify-otp", otpLimiter, verifyOtp);
router.post("/reset-password", otpLimiter, resetPassword);
// router.get("/me", authMiddleware, userDetails);

export default router;
