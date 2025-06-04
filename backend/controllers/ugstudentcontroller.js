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
                switch (user.bin) {
                    case 1:
                        try{
                            const teams=await BTPTeam.find({
                                "bin1.student": user._id
                            })
                            .populate("bin1.student")
                            .populate("bin2.student")
                            .populate("bin3.student")
                            
                            if(!teams){
                                return res.status(500).json({
                                    message: "Error finding team"
                                });
                            }
                            if(teams.length===0){
                                return res.status(200).json({
                                    message: "You are currently not in any full or partial team. Form a team"
                                });
                            }
                            if(teams.length>1){
                                return res.status(500).json({
                                    message: "Bin 1 student cant participate in more than one full or partial team"
                                }); 
                            }
                            const team=teams[0];
                            const simplifiedTeam = {
                                _id: team._id,
                                bin1: {
                                    email: team?.bin1.student.email,
                                    name: team?.bin1.student.name,
                                    approved: team?.bin1.approved
                                },
                                bin2: {
                                    email: team?.bin2.student.email,
                                    name: team?.bin2.student.name,
                                    approved: team?.bin2.approved
                                },
                                bin3: {
                                    email: team?.bin3.student.email,
                                    name: team?.bin3.student.name,
                                    approved: team?.bin3.approved
                                }
                            };
                            //im gonna send team id and student email to frontend
                            if(!team.bin2.approved||!team.bin3.approved){
                                return res.status(200).json({
                                    message: "Partial team",
                                    team: simplifiedTeam
                                });
                            }
                            return res.status(200).json({
                                message: "Full team",
                                team: simplifiedTeam
                            });
                        }
                        catch(err){
                            console.log(err);
                            return res.status(500).json({
                                message: "Error loading the details for bin1 student"
                            });
                        }
                            
                    case 2:
                    case 3:
                        try{
                            const querystring=`bin${user.bin}.student`;
                            const teams=await BTPTeam.find({
                                [querystring]: user._id
                            })
                            .populate("bin1.student")
                            .populate("bin2.student")
                            .populate("bin3.student")
                            
                            if(!teams){
                                return res.status(500).json({
                                    message: "Error finding team"
                                });
                            }
                            if(teams.length===0){
                                return res.status(200).json({
                                    message: "You are currently not in any full or partial team. Form a team"
                                });
                            }
                            const binkey=`bin${user.bin}`
                            if(teams.length===1&&teams[0][binkey].approved){
                                const team=teams[0];
                                const simplifiedTeam = {
                                    _id: team._id,
                                    bin1: {
                                        email: team?.bin1.student.email,
                                        name: team?.bin1.student.name,
                                        approved: team?.bin1.approved
                                    },
                                    bin2: {
                                        email: team?.bin2.student.email,
                                        name: team?.bin2.student.name,
                                        approved: team?.bin2.approved
                                    },
                                    bin3: {
                                        email: team?.bin3.student.email,
                                        name: team?.bin3.student.name,
                                        approved: team?.bin3.approved
                                    }
                                };
                                if(team.isteamformed){
                                    return res.status(200).json({
                                        message: "Full team bin2",
                                        team: simplifiedTeam
                                    });
                                }
                                return res.status(200).json({
                                    message: "Partial Team but self approved",
                                    team: simplifiedTeam
                                });
                            }
                            //handle the case where bin2 approved but length>1
                            else{
                                const newteams=teams.map((team)=>{
                                    const simplifiedTeam = {
                                        _id: team._id,
                                        bin1: {
                                            email: team?.bin1.student.email,
                                            name: team?.bin1.student.name,
                                            approved: team?.bin1.approved
                                        },
                                        bin2: {
                                            email: team?.bin2.student.email,
                                            name: team?.bin2.student.name,
                                            approved: team?.bin2.approved
                                        },
                                        bin3: {
                                            email: team?.bin3.student.email,
                                            name: team?.bin3.student.name,
                                            approved: team?.bin3.approved
                                        }
                                    };
                                    return simplifiedTeam;
                                });
                                return res.status(200).json({
                                    message: "Partial teams but not self approved",
                                    teams: newteams
                                });
                            }
                        }
                        catch(err){
                            return res.status(500).json({
                                message: `Error loading the details for bin${user.bin} student`,
                            });
                        }
                                            
                    default:
                        return res.status(500).json({
                            message: "Invalid Bin"
                        });
                }
                
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
            message: "Error loading the BTP dashboard"
        });
    }
}

export const verifyBin=({bin})=>{
    return async (req, res, next)=>{
        try{
            const user=await UGStudent.findOne({
                email: req.user.email,
            });
            if(!bin.includes(user.bin)){
                return res.status(403).json({
                    message: "Only bin 1 student can access this page"
                });
            }
            req.userid=user._id;
            next();
        }
        catch(err){
            return res.status(500).json({
                message: "Error verifying the bin of student"
            });
        }
    }
}

export const createTeam=async (req, res)=>{
    try{
        if(!req.userid){
            return res.status(500).json({
                message: "No user id found"
            });
        }
        if(!req.body.bin2email||!req.body.bin3email){
            return res.status(400).json({
                message: "No bin2 or bin3 student selected"
            });
        }
        const teams=await BTPTeam.find({
            "bin1.student": req.userid
        }); 
        if(teams.length!==0){
            return res.status(400).json({
                message: "Cant create team when you are already in one"
            });
        }
        const bin2stu=await UGStudent.findOne({
            email: req.body.bin2email
        });
        const bin3stu=await UGStudent.findOne({
            email: req.body.bin3email
        });
        //verify bin2 or 3 and see they didnt approve any other team
        const checkbinandverify=async(stu, bin=-1)=>{
            if(bin===-1){
                return res.status(500).json({
                    message: "Error: No bin provided",
                });
            }
            if(!stu){
                return res.status(400).json({
                    message: `Invalid email for bin${bin}`
                });
            }
            if(stu.bin!==bin){
                return res.status(400).json({
                    message: `Invalid bin for ${stu.email}`
                });
            }
            const str=`bin${bin}.student`
            const teamss=await BTPTeam.find({
                [str]: stu._id,
            });
            teamss.forEach((team)=>{
                if(team[`bin${bin}`].approved){
                    throw {
                        status: 400,
                        message: `Can't create team because ${stu.email} is already in another approved team`
                    };
                }
            });
            return true;
        }
        const bin2Check=await checkbinandverify(bin2stu, 2);
        const bin3Check=await checkbinandverify(bin3stu, 3);
        if(bin2Check&&bin3Check){
            const newteam= new BTPTeam({
                bin1: {
                    student: req.userid,
                    approved: true,
                },
                bin2:{
                    student: bin2stu._id,
                    approved: false,
                },
                bin3:{
                    student: bin3stu._id,
                    approved: false
                },
                isteamformed: false
            });
            await newteam.save();
            return res.status(201).json({
                message: `Team formation request sent to ${bin2stu.email} and ${bin3stu.email} successfully`
            });
        }
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error creating team"
        });
    }
}