import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const authMiddleware=async (req, res, next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const token=authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(403).json({
            message: "Invalid or Expired Token"
        });
    }
}

export const handleLogin = async (req, res)=>{
    const {email, pass}=req.body;
    const user=await User.findOne({email: email});
    if(!user){
        return res.status(401).json({
            msg: "Invalid Email"
        });
    }
    const isPasswordCorrect=await bcrypt.compare(pass, user.password);
    if(!isPasswordCorrect){
        return res.status(401).json({
            message: "Invalid Password"
        });
    }
    const payload={
        email: user.email,
        role: user.role,
    }
    const jwt_token=jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30m",
    });
    return res.json({
        token: jwt_token,
    });
}