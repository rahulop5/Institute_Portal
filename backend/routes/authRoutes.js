import express from "express";
import {
    handleLogin,
    authMiddleware
} from "../controllers/authController.js";

const router=express.Router();

router.post("/login", handleLogin);

export default router;