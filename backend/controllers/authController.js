import User from "../models/User.js";
import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

//ik this is highly unscalable but cant find out a better solution
// import UGStudent from "../models/UGStudent.js";
// import Faculty from "../models/Faculty.js";
// import Staff from "../models/Staff.js";
// import PrivilegedUser from "../models/PrivilegedUser.js";
// import Admin from "../models/Admin.js";

// const RoleModelMap = {
//     UGStudent: UGStudent,
//     Faculty: Faculty,
//     Staff: Staff,
//     PrivilegedUser: PrivilegedUser,
//     Admin: Admin
// };

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
    if (!["UGStudentBTP", "Student"].includes(decoded.role)) {
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

// export const userDetails=async(req, res)=>{
//     try{
//         const { email, role } = req.user;
//         const Model = RoleModelMap[role];
//         if (!Model){
//             return res.status(400).json({
//                 message: "Invalid role"
//             });
//         }
//         const user=Model.findOne({
//             email: req.user.email
//         });

//     }
//     catch(err){
//         console.log(err);
//         return res.status(500).json({
//             message: "Error getting the details of the student"
//         });
//     }
// }
