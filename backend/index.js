import express from "express";
import connectDB from "./config/db.js";
import env from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import ugstudentbtpRoutes from "./routes/ugstudentbtpRoutes.js";
import staffbtpRoutes from "./routes/staffbtpRoutes.js";
import facultybtpRoutes from "./routes/facultybtpRoutes.js";
import ugstudenthonorsroutes from "./routes/ugstudenthonorsRoutes.js"
import feedbackstudentRoutes from "./routes/feedback/feedbackstudentRoutes.js";
import feedbackfacultyRoutes from "./routes/feedback/feedbackfacultyRoutes.js";
import feedbackadminRoutes from "./routes/feedback/feedbackadminRoutes.js";

const app=express();
app.use(cors({
    origin: "https://feedback-frontend-uk6j.vercel.app"
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
env.config();
connectDB();

app.use("/auth", authRoutes);

//BTP
app.use("/student/btp", ugstudentbtpRoutes);
app.use("/staff/btp", staffbtpRoutes);
app.use("/faculty/btp", facultybtpRoutes);

//Honors
app.use("/student/honors", ugstudenthonorsroutes);

//Feedback
app.use("/student/feedback", feedbackstudentRoutes);
app.use("/faculty/feedback", feedbackfacultyRoutes);
app.use("/puser/feedback", feedbackadminRoutes);


app.get("/test", (req, res)=>{
    res.json({
        message: "Hello from venakamaala(backend)"
    });
});

//add the page not found thing

//add to env later
app.listen(3000, "0.0.0.0", ()=>{
    console.log("Server Running on port 3000")
});