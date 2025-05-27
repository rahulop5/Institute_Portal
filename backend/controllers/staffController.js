import jwt from "jsonwebtoken";
import BTPSystemState from "../models/BTPSystemState.js";
import fs from "fs";
import csvParser from "csv-parser";
import UGStudent from "../models/UGStudent.js";

export const authStaffMiddleware=async (req, res, next)=>{
    const authHeader=req.headers.authorization;
    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    const token=authHeader.split(" ")[1];
    try{
        const decoded=jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role!="Staff"){
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

export const getStaffBTPDashboard=async (req, res)=>{
    if(!req.query.year){
        return res.status(400).json({
            message: "No year specified"
        });
    }
    const year=req.query.year;
    const currstate=await BTPSystemState.findOne({
        studentbatch: year
    });
    if(!currstate){
        return res.status(404).json({
            message: "No batch found"
        })
    }
    switch (currstate.currentPhase) {
        case "NOT_STARTED":
            return res.status(200).json({
                message: "Upload CSV Sheet of bins"
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
            })
    }    
}

export const uploadCSVSheet=async (req, res)=>{
    if(!req.query.year){
        return res.status(400).json({
            message: "No year specified"
        });
    }
    const year=req.query.year;
    const currstate=await BTPSystemState.findOne({
        studentbatch: year
    });
    if(!currstate){
        return res.status(404).json({
            message: "No batch found"
        });
    }
    if(currstate.currentPhase!=="NOT_STARTED"){
        return res.status(400).json({
            message: "Cant upload bins at this phase"
        });
    }
    try{
        const filePath="./uploads/bins.csv";
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", async (row)=>{
                const {email, bin}=row;
                if(!email||!bin){
                    return res.status(400).json({
                        message: "No email or bin found"
                    });
                }
                const result=await UGStudent.findOneAndUpdate(
                    {email: email.trim()},
                    {bin: Number(bin)},
                    {new: true}
                );
                if(!result){
                    return res.status(404).json({
                        message: `Not able to update bin for ${email}, Exiting...`
                    });
                }
            })
            .on("end", async ()=>{
                currstate.currentPhase="TEAM_FORMATION";
                currstate.updatedAt=Date.now();
                await currstate.save();
                res.status(200).json({
                    message: "Updated Bins successfully. Team Formation phase started"
                });
            })
            .on("error", (err)=>{
                console.log(err);
                return res.status(500).json({
                    message: "Error parsing csv file"
                });
            });
    }
    catch(err){
        return res.status(500).json({
            message: "Error updating bins of students"
        });
    }
}