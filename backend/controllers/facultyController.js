import jwt from "jsonwebtoken";
import Faculty from "../models/Faculty.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTopic from "../models/BTPTopic.js";

export const authFacultyMiddleware=async (req, res, next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const token=authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role!=="Faculty"){
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

export const getFacultyBTPDashboard=async (req, res)=>{
    const user=await Faculty.findOne({
        email: req.user.email
    });
    if(!user){
        return res.status(404).json({
            message: "Error finding the faculty"
        });
    }
    try{
        if(!req.query.batch){
            return res.status(400).json({
                message: "batch not found in the request"
            });
        }
        const currstate=await BTPSystemState.findOne({
            studentbatch: req.query.batch
        });
        if(!currstate){
            return res.status(400).json({
                message: "Invalid batch"
            });
        }
        switch (currstate.currentPhase) {
            case "NOT_STARTED":
            case "TEAM_FORMATION":
            case "FACULTY_ASSIGNMENT":
                const topics=await BTPTopic.findOne({
                    faculty: user._id
                });
                if(!topics){
                    return res.status(200).json({
                        message: "Please upload your topics for BTP"
                    });
                }    
                return res.status(200).json({
                    message: "You have uploaded the topics",
                    topics: topics.topics
                });
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
        return res.status(err.status||500).json({
            message: err.message||"Error loading the dashboard"
        })
    }
}

export const releaseTopics=async (req, res)=>{
    //cant send arrays in url encoded ffs only in raw
    const user=await Faculty.findOne({
        email: req.user.email
    });
    if(!user){
        return res.status(404).json({
            message: "Error finding the faculty"
        });
    }
    const topicscheck=await BTPTopic.findOne({
        faculty: user._id
    });
    if(topicscheck){
        return res.status(200).json({
            message: "Already uploaded your topics"
        });
    }
    if(!req.body.topics){
        return res.status(400).json({
            message: "No topics found"
        });
    }
    const topics=req.body.topics;
    try{
        const strcheck=topics.every(item => typeof item === "string");
        if(!strcheck){
            return res.status(400).json({
                message: "Topics can only be strings"
            });
        }
        const newtopics=new BTPTopic({
            faculty: user._id,
            topics: topics
        });
        await newtopics.save();
        return res.status(201).json({
            message: "Topics uploaded successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error releasing the topics"
        })
    }
}