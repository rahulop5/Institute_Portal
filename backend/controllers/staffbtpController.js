import BTPSystemState from "../models/BTPSystemState.js";
import fs from "fs";
import csvParser from "csv-parser";
import UGStudent from "../models/UGStudent.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";

//have to send the additional details to frontend
export const getStaffBTPDashboard=async (req, res)=>{
    try{
        if(!req.query.batch){
            return res.status(400).json({
                message: "No batch specified"
            });
        }
        const batch=req.query.batch;
        const currstate=await BTPSystemState.findOne({
            studentbatch: batch
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
                        .populate("bin1.student", "name email bin")
                        .populate("bin2.student", "name email bin")
                        .populate("bin3.student", "name email bin");

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
                            bin1: team.bin1?.student ? { email: team.bin1.student.email, bin: team.bin1.student.bin, name: team.bin1.student.name } : null,
                            bin2: team.bin2?.student ? { email: team.bin2.student.email, bin: team.bin2.student.bin, name: team.bin2.student.name } : null,
                            bin3: team.bin3?.student ? { email: team.bin3.student.email, bin: team.bin3.student.bin, name: team.bin3.student.name } : null,
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
                try{
                    //can possibly uk attach the approved requests to topics but we can do it in frontend too
                    const topics=await BTPTopic.find()
                    .populate("faculty")
                    .populate("requests.teamid")

                    const approvedTeamIds = [];
                    
                    //deleting teh pending requests and addin assgined teams
                    topics.forEach((topic)=>{
                        topic.requests=topic.requests.filter((request)=>{
                            return request.isapproved;
                        });
                        topic.requests.forEach(request => {
                            approvedTeamIds.push(request.teamid._id.toString());
                        });
                    });

                    const teams = await BTPTeam.find()
                        .populate("bin1.student", "name email bin")
                        .populate("bin2.student", "name email bin")
                        .populate("bin3.student", "name email bin");
                    
                    //separating the teams 
                    const assignedTeams = [];
                    const unassignedTeams = [];

                    teams.forEach(team => {
                        if (approvedTeamIds.includes(team._id.toString())) {
                            assignedTeams.push(team);
                        } else {
                            unassignedTeams.push(team);
                        }
                    });                        
                    
                    return res.status(200).json({
                        phase: "FA",
                        topics: topics,
                        assignedTeams: assignedTeams,
                        unassignedTeams: unassignedTeams
                    });
                }
                catch(err){
                    console.error(err);
                    return res.status(500).json({ message: "Error loading dashboard" });
                }

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
    if(!req.query.batch){
        return res.status(400).json({
            message: "No batch specified"
        });
    }
    const batch=req.query.batch;
    const currstate=await BTPSystemState.findOne({
        studentbatch: batch
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

export const allocateFacultytoTeam=async(req, res)=>{
    try{
        if(!req.body.docid||!req.body.topicid||!req.body.teamid){
            return res.status(400).json({
                message: "Invalid details sent"
            });
        }
        const {docid, topicid, teamid}=req.body;
        const teamcheck=await BTPTopic.findOne({
            "requests.teamid": teamid,
            "requests.isapproved": true
        });
        if(teamcheck){
            return res.status(400).json({
                message: "This team is already assigned to a faculty"
            })
        }
        const topicdoc = await BTPTopic.findById(docid);
        if (!topicdoc) {
            return res.status(404).json({ message: "Faculty topic document not found" });
        }
        const topic = topicdoc.topics.id(topicid);
        if (!topic) {
            return res.status(404).json({ message: "Topic not found under this faculty" });
        }
        topicdoc.requests.push({
            teamid: teamid,
            topic: topicid,
            isapproved: true
        });
        await topicdoc.save();
        //saving in actual BTP Project
        const team = await BTPTeam.findById(teamid);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        const studentIds = [team.bin1?.student, team.bin2?.student, team.bin3?.student].filter(Boolean);
        const formattedStudents = studentIds.map(id => ({ student: id }));

        const newbtpproj = new BTP({
            name: topic.topic,
            about: topic.about,
            studentbatch: team.batch,
            students: formattedStudents,
            guide: topicdoc.faculty
        });

        await newbtpproj.save();

        return res.status(200).json({
            message: "Faculty successfully allocated to team"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error allocating faculty"
        });
    }
}

export const deallocateFacultyforTeam = async (req, res) => {
    try {
        const { teamid } = req.body;
        if (!teamid) {
            return res.status(400).json({
                message: "Team ID is required"
            });
        }
        const topicDoc = await BTPTopic.findOne({
            "requests.teamid": teamid,
            "requests.isapproved": true
        });
        if (!topicDoc) {
            return res.status(404).json({
                message: "This team is not assigned to any faculty"
            });
        }
        const approvedRequest = topicDoc.requests.find(
            req => req.teamid.toString() === teamid && req.isapproved
        );

        if (!approvedRequest) {
            return res.status(404).json({
                message: "Approved request not found"
            });
        }
        const approvedTopicId = approvedRequest.topic;
        topicDoc.requests = topicDoc.requests.filter(
            req => req.teamid.toString() !== teamid
        );
        await topicDoc.save();

        const team = await BTPTeam.findById(teamid);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }
        const studentIds = [team.bin1.student, team.bin2?.student, team.bin3?.student].filter(Boolean);

        await BTP.deleteOne({
            guide: topicDoc.faculty,
            students: {
                $all: studentIds.map(id => ({ student: id }))
            }
        });

        return res.status(200).json({
            message: "Successfully deallocated faculty from team"
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error deallocating faculty from team"
        });
    }
};

export const endFacultyAssignmentPhase=async(req, res)=>{
    try{
        if(!req.query.batch){
            return res.status(400).json({
                message: "Incomplete request. No batch mentioned"
            });
        }
        const currphase=await BTPSystemState.findOne({
            studentbatch: req.query.batch
        });
        if(currphase.currentPhase!=="FACULTY_ASSIGNMENT"){
            return res.status(400).json({
                message: "Cant access this page now"
            });
        }
        currphase.currentPhase="IN_PROGRESS";
        await currphase.save();
        return res.status(201).json({
            message: `Successfully moved batch ${req.query.batch} to In Progress phase` 
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error verifying the phase"
        });
    }
}
