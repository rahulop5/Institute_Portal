import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import Student from "../models/feedback/Student.js";
import Faculty from "../models/Faculty.js";
import UGProjects from "../models/UGProjects.js";
import PrivilegedUser from "../models/PrivilegedUser.js";
import Admin from "../models/Admin.js";
import Course from "../models/feedback/Course.js";
import Enrollment from "../models/feedback/Enrollment.js";
import nodemailer from "nodemailer";
import { str, normEmail } from "../utils/security.js";

// One verifier for every role. Besides the signature it checks, against the database, that the
// account still exists with the role in the token and that the token was issued after the last
// password change/reset, so a reset (e.g. after a stolen password) logs out every old session.
const verifyAs = (roles) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  let decoded;
  try {
    decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch (err) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
  if (typeof decoded?.email !== "string" || typeof decoded.role !== "string") {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }
  if (roles && !roles.includes(decoded.role)) {
    return res.status(403).json({ message: "You dont have access to this page" });
  }
  try {
    const user = await User.findOne({ email: decoded.email }).select("role passwordChangedAt").lean();
    if (!user || user.role !== decoded.role) {
      return res.status(403).json({ message: "Invalid or Expired Token" });
    }
    // iat has 1-second precision: a token from the same second as the change counts as old
    // (tokens issued after a change are stamped one second later, see signToken).
    if (user.passwordChangedAt && (decoded.iat || 0) <= Math.floor(new Date(user.passwordChangedAt).getTime() / 1000)) {
      return res.status(403).json({ message: "Invalid or Expired Token" });
    }
  } catch (err) {
    console.error("auth lookup failed:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
  req.user = decoded;
  next();
};

export const authMiddleware = verifyAs(null);
export const authStudentMiddleware = verifyAs(["Student"]);
export const authHonorsStudentMiddleware = verifyAs(["Student"]);
export const authUGProjectsMiddleware = verifyAs(["UGProjects"]);
export const authAssistantDeanMiddleware = verifyAs(["AssistantDean"]);
export const authAdminMiddleware = verifyAs(["Admin"]);
export const authFacultyMiddleware = verifyAs(["Faculty"]);

// Opening/closing feedback and resetting a semester's feedback affect every
// department at once, so only Dean Academic accounts (Admins with
// Admin.isDean set) and the portal super-admins below may do them.
const SUPER_ADMIN_EMAILS = ["prod.admin@iiits.in"];

export const canControlFeedback = (admin) =>
  !!admin && (admin.isDean || SUPER_ADMIN_EMAILS.includes(admin.email?.toLowerCase()));

// Adding faculty, students or courses and editing, deleting or resetting
// courses is kept to the staff admin account and the portal super-admins -
// not HODs, not the Dean.
export const canManageRecords = (admin) =>
  !!admin && (admin.isStaff || SUPER_ADMIN_EMAILS.includes(admin.email?.toLowerCase()));

// Mount this after authAdminMiddleware on course/student management routes.
export const requireRecordManagerMiddleware = async (req, res, next) => {
  const admin = await Admin.findOne({ email: req.user.email });
  if (!canManageRecords(admin)) {
    return res.status(403).json({
      message: "Only the staff account can add or change faculty, courses and students",
    });
  }
  next();
};

// Mount this after authAdminMiddleware.
export const requireDeanMiddleware = async (req, res, next) => {
  const admin = await Admin.findOne({ email: req.user.email });
  if (!canControlFeedback(admin)) {
    return res.status(403).json({
      message: "Only the Dean Academic account can do this",
    });
  }
  next();
};

const signToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const changed = user.passwordChangedAt ? Math.floor(new Date(user.passwordChangedAt).getTime() / 1000) : 0;
  const iat = Math.max(now, changed + 1);
  return jwt.sign({ email: user.email, role: user.role, iat, exp: iat + 3600 }, process.env.JWT_SECRET, { algorithm: "HS256" });
};

// Compared against when the email is unknown, so both cases take the same time.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10);
const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

export const handleLogin = async (req, res) => {
  const email = normEmail(req.body?.email);
  const pass = str(req.body?.pass);
  if (!email || !pass || pass.length > MAX_PASSWORD) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    const ok = await bcrypt.compare(pass, user ? user.password : DUMMY_HASH);
    if (!user || !ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    return res.json({
      name: "User",
      role: user.role,
      token: signToken(user),
    });
  } catch (err) {
    console.error("login failed:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const changePassword = async (req, res) => {
  try {
    const oldPassword = str(req.body?.oldPassword);
    const newPassword = str(req.body?.newPassword);

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }
    if (newPassword.length < MIN_PASSWORD || newPassword.length > MAX_PASSWORD) {
      return res.status(400).json({ message: `The new password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` });
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

    user.password = await bcrypt.hash(newPassword, 10);
    // Logs out every other session; this one gets a fresh token below.
    user.passwordChangedAt = new Date();
    await user.save();

    return res.status(200).json({ message: "Password changed successfully!", token: signToken(user) });
  } catch (err) {
    console.error("Error changing password:", err);
    return res.status(500).json({ message: "Error changing password" });
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
                 profileData.canControlFeedback = canControlFeedback(adminDetails);
                 profileData.canManageRecords = canManageRecords(adminDetails);
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
    } else if (user.role === "Student") {
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
    // Add other roles if necessary (UGProjects, AssistantDean, PrivilegedUser)

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
          roleModel = Student;
          break;
        case "UGProjects":
          roleModel = UGProjects;
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

// Same answer whether or not the email has an account, so the form can't be used to find accounts.
const OTP_SENT = { message: "If that email has an account, an OTP has been sent to it." };
const OTP_INVALID = { message: "Invalid or expired OTP" };
const OTP_TTL_MS = 10 * 60 * 1000;
// Wrong guesses allowed per OTP (verify and reset both count); after that it is void.
const MAX_OTP_TRIES = 5;

export const forgotPassword = async (req, res) => {
  try {
    const email = normEmail(req.body?.email);
    if (!email) return res.status(400).json({ message: "Enter your email" });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(OTP_SENT);

    // Rate Limiting: Max 3 emails per 24 hours
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    if (user.lastOtpSentAt && user.lastOtpSentAt < oneDayAgo) {
      user.otpAttemptCount = 0;
    }
    if (user.otpAttemptCount >= 3) {
      return res.status(429).json({ message: "Limit exceeded. Try again tomorrow." });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetOtp = await bcrypt.hash(otp, 10); // only the hash is stored
    user.resetOtpExpire = new Date(now.getTime() + OTP_TTL_MS);
    user.otpVerifyAttempts = 0;
    user.lastOtpSentAt = now;
    user.otpAttemptCount += 1;
    await user.save();

    // Always to the address on the account, never to what the request said.
    // Not awaited: the response time must not depend on whether the account exists.
    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}\n\nIt expires in 10 minutes. If you did not ask for this, ignore this email.`,
      })
      .catch((error) => console.error("OTP email failed:", error.message));
    return res.status(200).json(OTP_SENT);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Spends one try atomically before comparing, so parallel guessing can't exceed MAX_OTP_TRIES.
async function checkOtp(body) {
  const email = normEmail(body?.email);
  const otp = str(body?.otp);
  if (!email || !otp || !/^\d{6}$/.test(otp)) return null;
  const user = await User.findOneAndUpdate(
    { email, resetOtp: { $exists: true }, resetOtpExpire: { $gt: new Date() }, otpVerifyAttempts: { $not: { $gte: MAX_OTP_TRIES } } },
    { $inc: { otpVerifyAttempts: 1 } },
    { new: true }
  );
  if (!user) return null;
  // Older plain-text OTPs (before hashing) are simply treated as invalid; they expire in 10 minutes.
  const ok = user.resetOtp?.startsWith("$2") && (await bcrypt.compare(otp, user.resetOtp));
  if (!ok) {
    if (user.otpVerifyAttempts >= MAX_OTP_TRIES)
      await User.updateOne({ _id: user._id }, { $unset: { resetOtp: "", resetOtpExpire: "" } });
    return null;
  }
  return user;
}

export const verifyOtp = async (req, res) => {
  try {
    const user = await checkOtp(req.body);
    if (!user) return res.status(400).json(OTP_INVALID);
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const newPassword = str(req.body?.newPassword);
    if (!newPassword || newPassword.length < MIN_PASSWORD || newPassword.length > MAX_PASSWORD) {
      return res.status(400).json({ message: `The new password must be ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` });
    }
    const user = await checkOtp(req.body);
    if (!user) return res.status(400).json(OTP_INVALID);

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordChangedAt = new Date(); // logs out every existing session
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    user.otpVerifyAttempts = 0;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
