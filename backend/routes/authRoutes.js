import express from "express";
import {
    authMiddleware,
    changePassword,
    handleLogin,
    // userDetails,
} from "../controllers/authController.js";

const router=express.Router();

router.post("/login", handleLogin);
router.post("/changepassword", authMiddleware,  changePassword);
// router.get("/me", authMiddleware, userDetails);

export default router;
