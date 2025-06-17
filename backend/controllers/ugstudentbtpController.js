import UGStudent from "../models/UGStudent.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPTopic from "../models/BTPTopic.js";

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
                try{
                    const querystring=`bin${user.bin}.student`;
                    const teams=await BTPTeam.find({
                        [querystring]: user._id
                    })
                    .populate("bin1.student")
                    .populate("bin2.student")
                    .populate("bin3.student")
                    if(teams.length===0){
                        return res.status(400).json({
                            message: "Team not found"
                        });
                    }
                    if(teams.length!==1){
                        return res.status(400).json({
                            message: "More than one team found"
                        });
                    }
                    const team=teams[0];
                    if(!team.isteamformed){
                        return res.status(400).json({
                            message: "Not all members have approved the request to join this team"
                        });
                    }
                    const topics=await BTPTopic.find().populate("faculty");
                    const cleanedTopics = topics.map(topic => {
                        return {
                            _id: topic._id,
                            faculty: {
                                name: topic?.faculty.name,
                                email: topic?.faculty.email,
                                dept: topic?.faculty.dept,
                                role: topic?.faculty.role
                            },
                            topics: topic?.topics, // keep as is
                            requests: topic?.requests // keep as is
                        };
                    });
                    
                    return res.status(200).json({
                        message: "BTP Topics",
                        topics: cleanedTopics
                    });
                }
                catch(err){
                    console.log(err);
                    return res.status(500).json({
                        message: "Error loading the dashboard in Faculty assignment phase"
                    });
                }
                
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

export const verifyBinAndPhase=({bin, phase})=>{
    return async (req, res, next)=>{
        try{
            const user=await UGStudent.findOne({
                email: req.user.email,
            });
            if(!bin.includes(user.bin)){
                return res.status(403).json({
                    message: "A student in your bin cant access this page"
                });
            }
            const currphase=await BTPSystemState.findOne({
                studentbatch: user.batch
            });
            if(currphase.currentPhase!==phase){
                return res.status(400).json({
                    message: "Cant access this page now"
                });
            }
            req.user=user;
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
        if(!req.user){
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
            "bin1.student": req.user._id
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
        if(!bin2stu||!bin3stu){
            return res.status(400).json({
                message: "Invalid email(s)"
            });
        }
        if(req.user.batch!==bin2stu.batch||req.user.batch!==bin3stu.batch){
            return res.status(400).json({
                message: "Cant form a team with students of different batch"
            });
        }
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
                batch: req.user.batch,
                bin1: {
                    student: req.user._id,
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

export const approveTeamRequest = async (req, res)=>{
    try{
        if(!req.body.teamid){
            return res.status(400).json({
                message: "No team id found"
            });
        }
        if(!req.user){
            return res.status(500).json({
                message: "No user found"
            });
        }
        const binstr=`bin${req.user.bin}.student`
        const teams=await BTPTeam.find({
            [binstr]: req.user._id
        });
        const binstrshort=`bin${req.user.bin}`;
        teams.forEach((team)=>{
            if(team[binstrshort].approved){
                throw{
                    status: 400,
                    message: "Cant be in more than one team",
                }
            }
        });
        const currteam=teams.filter((team)=>{
            return team._id.toString()===req.body.teamid;
        });
        if(currteam.length===0){
            return res.status(400).json({
                message: "Cant approve a request u didnt get"
            });
        }
        if(currteam.length===1){
            const binstrapproved=`${binstrshort}.approved`;
            let setter={
                [binstrapproved]: true
            }
            const otherbin=req.user.bin===2?"bin3":"bin2";
            if(currteam[0][otherbin].approved){
                setter={
                    ...setter,
                    isteamformed: true
                };
            }
            await BTPTeam.findByIdAndUpdate(currteam[0]._id, {
                $set: setter
            }, {
                new: true
            });
            const otherteams=teams.filter((team)=>{
                return team._id.toString()!==req.body.teamid;
            });
            const deletee = await BTPTeam.deleteMany({
              _id: { $ne: req.body.teamid },
              [binstr]: { $eq: req.user._id }
            });
            return res.status(201).json({
                message: "Approved team request successfully"
            });
        }
        else{
            //im throwing here instead of returning becoz i want it to get printed in the server logs see catch block
            throw{
                status: 500,
                message: "More than one team found with the same team id"
            }
        }
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error approving the request"
        });
    }
}

export const facultyAssignmentRequest = async (req, res)=>{
    if(!req.body.docId||!req.body.topicId||!req.body.teamId){
        return res.status(400).json({
            message: "Invalid details sent"
        });
    }
    try{
        const {docId, topicId, teamId}=req.body;
        const facdoc=await BTPTopic.findOne({
            _id: docId
        });
        if(!facdoc){
            return res.status(400).json({
                message: "No faculty with that topic found"
            });
        }
        const topic=facdoc.topics.id(topicId);
        if(!topic){
            return res.status(400).json({
                message: "No topic with that facutly found"
            });
        }
        const team=await BTPTeam.findOne({
            _id: teamId
        });
        if(!team){
            return res.status(400).json({
                message: "Invalid team"
            });
        }
        const checkreq=facdoc.requests.filter((request)=>{
            return request.teamid.toString()===teamId && request.topic.toString()===topicId
        });
        if(checkreq.length!==0){
            return res.status(400).json({
                message: "Request already sent"
            });
        }
        const newrequest={
            teamid: teamId,
            topic: topicId,
            isapproved: false
        };
        facdoc.requests.push(newrequest);
        await facdoc.save();
        return res.status(201).json({
            message: "Request sent successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error sending request"
        });
    }
}

