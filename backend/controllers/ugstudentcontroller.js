import UGStudent from "../models/UGStudent.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTeam from "../models/BTPTeam.js";
import jwt from "jsonwebtoken";

export const authStudentMiddleware=async (req, res, next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const token=authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role!="UGStudent"){
            return res.status(403).json({
                message: "You dont have access to this page"
            });
        }
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(403).json({
            message: "Invalid or Expired Token"
        });
    }
}

export const getBTPDashboard=async (req, res)=>{
    const user=await UGStudent.findOne({
        email: req.user.email
    });
    if(!user){
        return res.status(404).json({
            message: "Error finding the student"
        });
    }
    if(!user.isBTP){
        return res.status(403).json({
            message: "You cant access this page"
        });
    }
    try{
        const year=user.batch;
        const currstate=await BTPSystemState.findOne({
            studentbatch: year,
        });
        console.log(currstate);
        if(!currstate){
            return res.status(404).json({
                message: `No batch found with the year ${year}`
            });
        }
        switch (currstate.currentPhase) {
            case "NOT_STARTED":
                return res.status(200).json({
                    message: "BTP Projects did not start yet" 
                });

            case "TEAM_FORMATION":
                
                break;
                
            case "FACULTY_ASSIGNMENT":
                
                break;

            case "IN_PROGRESS":
                
                break;

            case "COMPLETED":
                
                break;
        
            default:
                return res.status(500).json({
                    message: "Invalid Phase",
                });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error loading the dashboard"
        });
    }
}