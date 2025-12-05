import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import Staff from "../models/Staff.js";
import PrivilegedUser from "../models/PrivilegedUser.js";
import Admin from "../models/Admin.js";

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
            }
        }
    } else if (["UGStudentBTP", "UGStudentHonors", "Student"].includes(user.role)) {
         if (user.referenceId) {
             // Use the single Student model for all student types as requested
             const studentDetails = await Student.findById(user.referenceId);
            //  console.log("Found Student details:", studentDetails);
             if (studentDetails) {
                 profileData = { ...profileData, ...studentDetails.toObject() };
             }
        } else {
            console.log("No referenceId for student user");
        }
    }
    // Add other roles if necessary (Staff, PrivilegedUser)

    res.status(200).json(profileData);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};