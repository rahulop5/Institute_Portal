import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"

const app=express();
connectDB();

app.use("/auth", authRoutes);

app.listen(3000);