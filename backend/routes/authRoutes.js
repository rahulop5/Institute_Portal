import express from "express";
import {
    authMiddleware,
    handleLogin,
    // userDetails,
} from "../controllers/authController.js";

const router=express.Router();

router.post("/login", handleLogin);
// router.get("/me", authMiddleware, userDetails);

export default router;