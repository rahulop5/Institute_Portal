import express from "express";
import connectDB from "./config/db.js";
import env from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import ugstudentRoutes from "./routes/ugstudentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";

const app=express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
env.config();
connectDB();

app.use("/auth", authRoutes);
app.use("/student", ugstudentRoutes);
app.use("/staff", staffRoutes);
app.use("/faculty", facultyRoutes);

app.listen(3000);