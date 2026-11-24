// Must stay the first import: registers the query guard before any model is compiled.
import "./utils/queryGuard.js";
import express from "express";
import connectDB from "./config/db.js";
import env from "dotenv";
import cors from "cors";
import helmet from "helmet";
import {rejectOperators, errorHandler} from "./utils/security.js";
import authRoutes from "./routes/authRoutes.js";
import ugstudentbtpRoutes from "./routes/ugstudentbtpRoutes.js";
import staffbtpRoutes from "./routes/staffbtpRoutes.js";
import facultybtpRoutes from "./routes/facultybtpRoutes.js";
import ugstudenthonorsroutes from "./routes/ugstudenthonorsRoutes.js"
import facultyhonorsRoutes from "./routes/facultyhonorsRoutes.js"
import ugstudentapRoutes from "./routes/ugstudentapRoutes.js";
import facultyapRoutes from "./routes/facultyapRoutes.js";
import studentmeetingRoutes from "./routes/studentmeetingRoutes.js";
import facultymeetingRoutes from "./routes/facultymeetingRoutes.js";
import adminmeetingRoutes from "./routes/adminmeetingRoutes.js";
import programChangeRoutes from "./routes/programChangeRoutes.js";
import feedbackstudentRoutes from "./routes/feedback/feedbackstudentRoutes.js";
import feedbackfacultyRoutes from "./routes/feedback/feedbackfacultyRoutes.js";
import feedbackadminRoutes from "./routes/feedback/feedbackadminRoutes.js";
import questionsRoutes from "./routes/feedback/questionsRoutes.js";

const app=express();
app.disable("x-powered-by");
// Behind nginx/another proxy set TRUST_PROXY=1 (number of proxy hops) so rate limits see real client IPs.
if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);
app.use(helmet());
app.use(cors({
    origin: [
        "https://feedback-frontend-uk6j.vercel.app",
        "https://feedback.iiits.ac.in",
        "http://localhost:5173",
        // Optional extra origins for local previews, comma-separated.
        ...(process.env.EXTRA_CORS_ORIGINS ? process.env.EXTRA_CORS_ORIGINS.split(",") : []),
    ],
}));
// 2mb: the UG Projects link-students preview sends a whole file (up to 500 rows) at once.
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({extended: false, limit: "100kb"}));
// Rejects MongoDB operators ("$ne", "$gte", ...) and dotted paths smuggled in as request keys.
app.use(rejectOperators);
env.config();
connectDB();

app.use("/auth", authRoutes);

//BTP
app.use("/student/btp", ugstudentbtpRoutes);
app.use("/staff/btp", staffbtpRoutes);
app.use("/faculty/btp", facultybtpRoutes);

//Honors
app.use("/student/honors", ugstudenthonorsroutes);
app.use("/faculty/honors", facultyhonorsRoutes);

//Additional Project
app.use("/student/ap", ugstudentapRoutes);
app.use("/faculty/ap", facultyapRoutes);

//Meetings
app.use("/student/meetings", studentmeetingRoutes);
app.use("/faculty/meetings", facultymeetingRoutes);
app.use("/admin/meetings", adminmeetingRoutes);

//BTP/Honors drop or switch requests
app.use("/programchange", programChangeRoutes);

//Feedback
app.use("/student/feedback", feedbackstudentRoutes);
app.use("/faculty/feedback", feedbackfacultyRoutes);
app.use("/puser/feedback", feedbackadminRoutes);
app.use("/questions", questionsRoutes);


app.get("/test", (req, res)=>{
    res.json({
        message: "Hello from venakamaala(backend)"
    });
});

app.use((req, res) => res.status(404).json({message: "Not found"}));
// Never sends error details or stack traces to the client.
app.use(errorHandler);

//add to env later
app.listen(process.env.PORT || 3000, "0.0.0.0", ()=>{
    console.log(`Server Running on port ${process.env.PORT || 3000}`)
});