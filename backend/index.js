import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

import User from "./models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import UGStudent from "./models/UGStudent.js"

const app=express();
connectDB();

const createStudentAndUser = async () => {
  try {
    // 1. Create UGStudent document
    const studentData = {
      name: "Rahul",
      email: "rahul@example.com",
      dept: "CSE",
      rollno: "S202100123",
      phone: "9876543210",
      ug: "UG2",
      section: "A",
      bin: 42,
    };

    const existing = await UGStudent.findOne({ email: studentData.email });
    if (existing) {
      console.log("UGStudent already exists");
      return;
    }

    const student = new UGStudent(studentData);
    await student.save();
    console.log("✅ UGStudent created:", student._id);

    // 2. Hash password
    const plainPassword = "rahul@123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 3. Create User document
    const user = new User({
      email: student.email,
      password: hashedPassword,
      role: "UGStudent",
      referenceId: student._id,
      lastlogin: new Date(),
    });

    await user.save();
    console.log("✅ User created:", user._id);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    mongoose.disconnect();
  }
};

createStudentAndUser();

app.use("/auth", authRoutes);

app.listen(3000);