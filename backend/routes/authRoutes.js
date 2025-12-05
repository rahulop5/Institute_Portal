import express from "express";
import {
    authMiddleware,
    changePassword,
    handleLogin,
    getProfile,
    // userDetails,
    updateName,
} from "../controllers/authController.js";

const router=express.Router();

router.post("/login", handleLogin);
router.post("/changepassword", authMiddleware,  changePassword);
router.get("/profile", authMiddleware, getProfile);
router.post("/updateName", authMiddleware, updateName);
// router.get("/me", authMiddleware, userDetails);

export default router;
