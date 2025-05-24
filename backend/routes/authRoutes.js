import express from "express";
import {
    handleLogin,
    authMiddleware
} from "../controllers/authController.js";

const router=express.Router();

router.post("/login", handleLogin);
router.get("/randomtest", authMiddleware, (req, res)=>console.log(req.user));

export default router;