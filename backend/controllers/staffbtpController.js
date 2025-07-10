import BTPSystemState from "../models/BTPSystemState.js";
import fs from "fs";
import csvParser from "csv-parser";
import UGStudent from "../models/UGStudent.js";
import BTPTeam from "../models/BTPTeam.js";

//have to send the additional details to frontend
export const getStaffBTPDashboard=async (req, res)=>{
    try{
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
                try {
                    const teams = await BTPTeam.find()
                        .populate("bin1.student", "email bin")
                        .populate("bin2.student", "email bin")
                        .populate("bin3.student", "email bin");

                    const formedteams = teams.filter(team => team.isteamformed === true);
                    const partialteams = teams.filter(team => team.isteamformed === false);

                    const studentIdsInTeams = new Set();
                    teams.forEach(team => {
                        if (team.bin1?.student) studentIdsInTeams.add(team.bin1.student._id.toString());
                        if (team.bin2?.student) studentIdsInTeams.add(team.bin2.student._id.toString());
                        if (team.bin3?.student) studentIdsInTeams.add(team.bin3.student._id.toString());
                    });
                
                    const unteamedStudents = await UGStudent.find({
                        _id: { $nin: Array.from(studentIdsInTeams) }
                    }).select("email bin");
                
                    const formatTeam = (team) => {
                        return {
                            bin1: team.bin1?.student ? { email: team.bin1.student.email, bin: team.bin1.student.bin } : null,
                            bin2: team.bin2?.student ? { email: team.bin2.student.email, bin: team.bin2.student.bin } : null,
                            bin3: team.bin3?.student ? { email: team.bin3.student.email, bin: team.bin3.student.bin } : null,
                        };
                    };
                    const response = {
                        fullyFormedTeams: formedteams.map(formatTeam),
                        partiallyFormedTeams: partialteams.map(formatTeam),
                        unteamedStudents: unteamedStudents.map(student => ({
                            email: student.email,
                            bin: student.bin
                        }))
                    };
                    return res.status(200).json(response);
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ message: "Error loading BTP teams" });
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
                })
        }    
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error loading the dashboard"
        });
    }
}

export const verifyPhase=({phase})=>{
    return async (req, res, next)=>{
        try{
            if(!req.query.batch){
                return res.status(400).json({
                    message: "Incomplete request. No batch mentioned"
                });
            }
            const currphase=await BTPSystemState.findOne({
                studentbatch: req.query.batch
            });
            if(currphase.currentPhase!==phase){
                return res.status(400).json({
                    message: "Cant access this page now"
                });
            }
            next();
        }
        catch(err){
            return res.status(500).json({
                message: "Error verifying the phase"
            });
        }
    }
}

//basically this function ends the not_started phase
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
        console.log(err);
        return res.status(500).json({
            message: "Error updating bins of students"
        });
    }
}

//the studs who are in partial teams also come as unteamed 
//handle the case where no bin1 or other bins are left like abnormal teams
export const createTeambyStaff=async (req, res)=>{
    try{
        //handle batch of the students like make sure they are all from the intended batch
        if(!req.body.bin1||!req.body.bin2||!req.body.bin3){
            return res.status(500).json({
                message: "Incomplete request."
            });
        }
        const {bin1, bin2, bin3}=req.body;
        if(bin1===bin2||bin2===bin3||bin1===bin3){
            return res.status(400).json({
                message: "Emails need to be different"
            });
        }
        //im not verifying the bins of the students becoz uk obv reasons
        const verifyTeam=async (email)=>{
            const student=await UGStudent.findOne({
                email: email
            });
            if(!student){
                throw new Error(`Student not found with email ${email}`);
            }
            if(student.batch!==req.query.batch){
                throw new Error(`Student ${email} is not from batch ${batch}`);
            }
            const binstr=`bin${student.bin}.student`;
            const teams=await BTPTeam.find({
                [binstr]: student._id
            });
            if(teams.length===0){
                return student;
            }
            for (const team of teams) {
                if (team.isteamformed) {
                    return false; 
                }
            }
            return student;
        }
        const s1=await verifyTeam(bin1);
        const s2=await verifyTeam(bin2);
        const s3=await verifyTeam(bin3);
        if(!s1||!s2||!s3){
            return res.status(400).json({
                message: "All the students need to not be in any team"
            });
        }
        //create a new team
        const newteam=new BTPTeam({
            batch: req.query.batch,
            bin1: {
                student: s1._id,
                approved: true
            },
            bin2: {
                student: s2._id,
                approved: true
            },
            bin3: {
                student: s3._id,
                approved: true
            },
            isteamformed: true
        });
        await newteam.save();
        return res.status(200).json({
            message: "New team created successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error creating team"
        });
    }
}

export const deleteTeam=async(req, res)=>{
    try{
        if(!req.body.teamid){
            return res.status(400).json({
                message: "No Team selected"
            });
        }
        const deletee=await BTPTeam.deleteOne({
            _id: req.body.teamid,
            batch: req.query.batch
        });
        if(deletee.deletedCount!==1){
            return res.status(400).json({
                message: "Team not found"
            });
        }
        return res.status(201).json({
            message: "Successfully deleted the team"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error deleting team"
        });
    }
}

//literally in the name of the function
//currently considering the ideal case 
export const endTeamFormationPhase= async(req, res)=>{
    try{
        if(!req.query.batch){
            return res.status(400).json({
                message: "Incomplete request. No batch mentioned"
            });
        }
        const currphase=await BTPSystemState.findOne({
            studentbatch: req.query.batch
        });
        if(currphase.currentPhase!=="TEAM_FORMATION"){
            return res.status(400).json({
                message: "Cant access this page now"
            });
        }
        currphase.currentPhase="FACULTY_ASSIGNMENT";
        await currphase.save();
        return res.status(201).json({
            message: `Successfully moved batch ${req.query.batch} to Faculty Assignment phase` 
        });
    }
    catch(err){
        return res.status(500).json({
            message: "Error verifying the phase"
        });
    }
}