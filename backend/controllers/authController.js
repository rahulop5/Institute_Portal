import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import Staff from "../models/Staff.js";
import PrivilegedUser from "../models/PrivilegedUser.js";
import Admin from "../models/Admin.js";
import Course from "../models/feedback/Course.js";
import Enrollment from "../models/feedback/Enrollment.js";
import nodemailer from "nodemailer";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const authStudentMiddleware = async (req, res, next) => {
  console.log("authStudentMiddleware");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["UGStudentBTP", "Student", "UGStudentHonors"].includes(decoded.role)) {
      return res.status(403).json({
        message: "You dont have access to this page",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const authHonorsStudentMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role != "UGStudentHonors") {
      return res.status(403).json({
        message: "You dont have access to this page",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const authStaffMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role != "Staff") {
      return res.status(403).json({
        message: "You dont have access to this page",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const authAdminMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role != "Admin") {
      return res.status(403).json({
        message: "You dont have access to this page",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const authFacultyMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Faculty") {
      return res.status(403).json({
        message: "You dont have access to this page",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or Expired Token",
    });
  }
};

export const handleLogin = async (req, res) => {
  const { email, pass } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(401).json({
      msg: "Invalid Email",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(pass, user.password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }
  const payload = {
    email: user.email,
    role: user.role,
  };
  const jwt_token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return res.json({
    name: "User",
    role: user.role,
    token: jwt_token,
  });
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }

    // Get logged-in user's email from token middleware
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    user.password = hashed;

    await user.save();

    return res.status(200).json({ message: "Password changed successfully!" });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({
      message: "Error changing password",
      error: err.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = {
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // console.log("Fetching profile for:", user.email, "Role:", user.role, "RefID:", user.referenceId);

    // Fetch additional details based on role
    if (user.role === "Admin") {
        if (user.referenceId) {
             const adminDetails = await Admin.findById(user.referenceId);
             if(adminDetails) {
                 profileData = { ...profileData, ...adminDetails.toObject() };
             }
        }
    } else if (user.role === "Faculty") {
        if (user.referenceId) {
            const facultyDetails = await Faculty.findById(user.referenceId);
            if (facultyDetails) {
                profileData = { ...profileData, ...facultyDetails.toObject() };
                
                // Fetch teaching courses
                // console.log("Fetching courses for faculty ID:", user.referenceId);
                const teachingCourses = await Course.find({ faculty: user.referenceId });
                // console.log("Found teaching courses:", teachingCourses);
                
                profileData.courses = teachingCourses.map(c => ({
                    name: c.name,
                    code: c.code
                }));
            }
        }
    } else if (["UGStudentBTP", "UGStudentHonors", "Student"].includes(user.role)) {
         if (user.referenceId) {
             // Use the single Student model for all student types as requested
             const studentDetails = await Student.findById(user.referenceId);
             // console.log("Found Student details:", studentDetails);
             if (studentDetails) {
                 profileData = { ...profileData, ...studentDetails.toObject() };
                 
                 // Fetch enrolled courses
                 const enrollments = await Enrollment.find({ student: user.referenceId }).populate('course');
                 profileData.courses = enrollments.map(e => ({
                     name: e.course.name,
                     code: e.course.code
                 }));
             }
        } else {
            // console.log("No referenceId for student user");
        }
    }
    // Add other roles if necessary (Staff, PrivilegedUser)

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ message: "Valid name is required" });
    }

    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update User model
    user.name = name.trim();
    await user.save();

    // Update Role specific model
    if (user.referenceId) {
      let roleModel;
      switch (user.role) {
        case "Admin":
          roleModel = Admin;
          break;
        case "Faculty":
          roleModel = Faculty;
          break;
        case "Student":
        case "UGStudentBTP":
        case "UGStudentHonors":
          roleModel = Student;
          break;
        case "Staff":
          roleModel = Staff;
          break;
        default:
          roleModel = null;
      }

      if (roleModel) {
        await roleModel.findByIdAndUpdate(user.referenceId, { name: name.trim() });
      }
    }

    return res.status(200).json({ message: "Name updated successfully", name: user.name });
  } catch (err) {
    console.error("Error updating name:", err);
    return res.status(500).json({
      message: "Error updating name",
      error: err.message,
    });
  }
};

// --- Forgot Password Logic ---

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Rate Limiting: Max 3 emails per 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Reset count if last attempt was more than 24 hours ago
    if (user.lastOtpSentAt && user.lastOtpSentAt < oneDayAgo) {
      user.otpAttemptCount = 0;
    }

    if (user.otpAttemptCount >= 3) {
      return res.status(429).json({ message: "Limit exceeded. Try again tomorrow." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to DB (valid for 10 minutes)
    user.resetOtp = otp;
    user.resetOtpExpire = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins
    user.lastOtpSentAt = now;
    user.otpAttemptCount += 1;
    await user.save();

    // Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: "Error sending email" });
      } else {
        return res.status(200).json({ message: "OTP sent successfully" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpire < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Double check OTP just in case (though frontend should have verified)
    if (!user.resetOtp || user.resetOtp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
  
    if (user.resetOtpExpire < new Date()) {
        return res.status(400).json({ message: "OTP has expired" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    // Clear OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};