import express from "express";
import connectDB from "./config/db.js";
import env from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import ugstudentbtpRoutes from "./routes/ugstudentbtpRoutes.js";
import staffbtpRoutes from "./routes/staffbtpRoutes.js";
import facultybtpRoutes from "./routes/facultybtpRoutes.js";

const app=express();
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
env.config();
connectDB();

app.use("/auth", authRoutes);
app.use("/student/btp", ugstudentbtpRoutes);
app.use("/staff/btp", staffbtpRoutes);
app.use("/faculty/btp", facultybtpRoutes);

app.get("/test", (req, res)=>{
    res.json({
        message: "Hello from venakamaala(backend)"
    });
})

app.listen(3000);