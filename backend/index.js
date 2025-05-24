import express from "express";
import connectDB from "./config/db.js";
import env from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import ugstudentRoutes from "./routes/ugstudentRoutes.js"

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
env.config();
connectDB();

app.use("/auth", authRoutes);
app.use("/student", ugstudentRoutes);

app.listen(3000);