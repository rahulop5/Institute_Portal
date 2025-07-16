import UGStudentBTP from "../models/UGStudentBTP.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPEvaluation from "../models/BTPEvaluation.js"

//sending user details too in the response
export const getBTPDashboard=async (req, res)=>{
    try{
        const user=await UGStudentBTP.findOne({
            email: req.user.email
        });
        if(!user){
            return res.status(404).json({
                message: "Error finding the student"
            });
        }
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
                    email: user.email,
                    message: "BTP Projects did not start yet",
                    phase: "NS" 
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
                                    email: user.email,
                                    phase: "TF",
                                    bin: user.bin,
                                    message: "Error finding team"
                                });
                            }
                            if(teams.length===0){
                                //sending the available bin2 and bin3 guys/gals
                                const bin23total=await UGStudentBTP.find({
                                    batch: user.batch,
                                    bin: {$ne: 1}
                                });
                                //removed the uk guys who already formed a team
                                const bin2filter=await BTPTeam.find({
                                    "bin2.approved": true
                                }, "bin2.student");
                                const formatbin2filter=bin2filter.map((stu)=>{
                                    return stu.bin2.student.toString();
                                });

                                const bin3filter=await BTPTeam.find({
                                    "bin3.approved": true
                                }, "bin3.student");
                                const formatbin3filter=bin3filter.map((stu)=>{
                                    return stu.bin3.student.toString();
                                });
                                //here just formatting the DATA filtering aswell
                                const availablebin2bin3=bin23total.filter((stu)=>{
                                    return !(formatbin2filter.includes(stu._id.toString()) || formatbin3filter.includes(stu._id.toString()));
                                });
                                const availablebin2=availablebin2bin3.filter((stu)=>{
                                    return stu.bin===2;
                                }).map((stu)=>{
                                    return {
                                        name: stu.name,
                                        rollno: stu.rollno,
                                        email: stu.email,
                                    }
                                });
                                const availablebin3=availablebin2bin3.filter((stu)=>{
                                    return stu.bin===3;
                                }).map((stu)=>{
                                    return {
                                        name: stu.name,
                                        rollno: stu.rollno,
                                        email: stu.email,
                                    }
                                });
                                return res.status(200).json({
                                    name: user.name,
                                    email: user.email,
                                    phase: "TF",
                                    inteam: 0,
                                    bin: user.bin,
                                    message: "You are currently not in any full or partial team. Form a team",
                                    availablebin2: availablebin2,
                                    availablebin3: availablebin3
                                });
                            }
                            if(teams.length>1){
                                return res.status(500).json({
                                    email: user.email,
                                    phase: "TF",
                                    bin: user.bin,
                                    message: "Bin 1 student cant participate in more than one full or partial team"
                                }); 
                            }
                            const team=teams[0];
                            const simplifiedTeam = {
                                _id: team._id,
                                bin1: {
                                    email: team?.bin1.student.email,
                                    rollno: team.bin1.student.rollno,
                                    name: team?.bin1.student.name,
                                    approved: team?.bin1.approved
                                },
                                bin2: {
                                    email: team?.bin2.student.email,
                                    rollno: team.bin2.student.rollno,
                                    name: team?.bin2.student.name,
                                    approved: team?.bin2.approved
                                },
                                bin3: {
                                    email: team?.bin3.student.email,
                                    rollno: team.bin3.student.rollno,
                                    name: team?.bin3.student.name,
                                    approved: team?.bin3.approved
                                }
                            };
                            //im gonna send team id and student email to frontend
                            if(!team.bin2.approved||!team.bin3.approved){
                                return res.status(200).json({
                                    name: user.name,
                                    email: user.email,
                                    phase: "TF",
                                    inteam: 1,
                                    bin: user.bin,
                                    message: "Partial team",
                                    team: simplifiedTeam
                                });
                            }
                            return res.status(200).json({
                                name: user.name,
                                email: user.email,
                                phase: "TF",
                                inteam: 1,
                                bin: user.bin,
                                message: "Full team",
                                team: simplifiedTeam
                            });
                        }
                        catch(err){
                            console.log(err);
                            return res.status(500).json({
                                email: user.email,
                                phase: "TF",
                                bin: user.bin,
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
                                    email: user.email,
                                    phase: "TF",
                                    bin: user.bin,
                                    message: "Error finding team"
                                });
                            }
                            if(teams.length===0){
                                return res.status(200).json({
                                    email: user.email,
                                    inteam: 0,
                                    phase: "TF",
                                    bin: user.bin,
                                    message: "You are currently not in any full or partial team. Form a team by finding a bin1 student"
                                });
                            }
                            const binkey=`bin${user.bin}`
                            if(teams.length===1&&teams[0][binkey].approved){
                                const team=teams[0];
                                const simplifiedTeam = {
                                    _id: team._id,
                                    bin1: {
                                        email: team?.bin1.student.email,
                                        rollno: team.bin1.student.rollno,
                                        name: team?.bin1.student.name,
                                        approved: team?.bin1.approved
                                    },
                                    bin2: {
                                        email: team?.bin2.student.email,
                                        rollno: team.bin2.student.rollno,
                                        name: team?.bin2.student.name,
                                        approved: team?.bin2.approved
                                    },
                                    bin3: {
                                        email: team?.bin3.student.email,
                                        rollno: team.bin3.student.rollno,
                                        name: team?.bin3.student.name,
                                        approved: team?.bin3.approved
                                    }
                                };
                                if(team.isteamformed){
                                    return res.status(200).json({
                                        email: user.email,
                                        inteam: 1,
                                        phase: "TF",
                                        bin: user.bin,
                                        message: "Full team",
                                        team: simplifiedTeam
                                    });
                                }
                                return res.status(200).json({
                                    email: user.email,
                                    phase: "TF",
                                    inteam: 1,
                                    bin: user.bin,
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
                                            rollno: team.bin1.student.rollno,
                                            name: team?.bin1.student.name,
                                            approved: team?.bin1.approved
                                        },
                                        bin2: {
                                            email: team?.bin2.student.email,
                                            rollno: team.bin2.student.rollno,
                                            name: team?.bin2.student.name,
                                            approved: team?.bin2.approved
                                        },
                                        bin3: {
                                            email: team?.bin3.student.email,
                                            rollno: team.bin3.student.rollno,
                                            name: team?.bin3.student.name,
                                            approved: team?.bin3.approved
                                        }
                                    };
                                    return simplifiedTeam;
                                });
                                return res.status(200).json({
                                    email: user.email,
                                    inteam: 0,
                                    phase: "TF",
                                    bin: user.bin,
                                    message: "Partial teams but not self approved",
                                    teams: newteams
                                });
                            }
                        }
                        catch(err){
                            return res.status(500).json({
                                email: user.email,
                                phase: "TF",
                                bin: user.bin,
                                message: `Error loading the details for bin${user.bin} student`,
                            });
                        }
                                            
                    default:
                        return res.status(500).json({
                            phase: "TF",
                            message: "Invalid Bin"
                        });
                }
            //send addn details like phase etc
            //write the case where the faculty accepted the request    
            case "FACULTY_ASSIGNMENT":
                //where tf is the case where the student sent the request
                //only limited no of requests can be sent by a team and currently im keeping that limit as 3
                //i should prolly redo this thing
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
                            phase: "FA",
                            email: user.email,
                            message: "Team not found"
                        });
                    }
                    if(teams.length!==1){
                        return res.status(400).json({
                            phase: "FA",
                            email: user.email,
                            message: "More than one team found"
                        });
                    }
                    const team=teams[0];
                    if(!team.isteamformed){
                        return res.status(400).json({
                            phase: "FA",
                            email: user.email,
                            message: "Not all members have approved the request to join this team"
                        });
                    }
                    const filteredteam={
                        _id: team._id,
                        bin1: {
                            name: team.bin1.student.name,
                            email: team.bin1.student.email,
                            approved: team?.bin1.approved,
                            rollno: team.bin1.student.rollno,
                        },
                        bin2: {
                            name: team.bin2.student.name,
                            email: team.bin2.student.email,
                            approved: team?.bin2.approved,
                            rollno: team.bin2.student.rollno,
                        },
                        bin3: {
                            name: team.bin3.student.name,
                            email: team.bin3.student.email,
                            approved: team?.bin3.approved,
                            rollno: team.bin3.student.rollno,
                        }
                    }
                    const topics=await BTPTopic.find().populate("faculty");
                    let approvedRequest = null;
                    const outgoingRequests = [];
                    
                    //did this in 2 cases 
                    // 1) any of the faculty accepts the request in which all the other outgoing requests will be deleted and only the approved req is shown
                    // 2) if no request is approved we just show the status of outgoing requests

                    topics.forEach(topic => {
                        topic.requests.forEach(request => {
                            if (request.teamid.toString() === team._id.toString()) {
                                const matchedTopic = topic.topics.find(t => t._id.toString() === request.topic.toString());
                            
                                const requestData = {
                                    topicDocId: topic._id,
                                    faculty: {
                                        name: topic.faculty.name,
                                        email: topic.faculty.email,
                                        dept: topic.faculty.dept
                                    },
                                    requestedTopic: matchedTopic,
                                    isapproved: request.isapproved
                                };
                                //ideal case(not security wise integrity wise)
                                //i.e what do u do if there are more than 1 approved req ik its not possible but what if smone hacks and does it
                                if (request.isapproved) {
                                    approvedRequest = requestData;
                                } else {
                                    outgoingRequests.push(requestData);
                                }
                            }
                        });
                    });

                    return res.status(200).json({
                        phase: "FA",
                        email: user.email,
                        facultyassigned: approvedRequest?true:false,
                        bin: user.bin,
                        team: filteredteam,
                        message: "BTP Topics",
                        topics: topics.map(topic => ({
                            _id: topic._id,
                            faculty: {
                                name: topic.faculty.name,
                                email: topic.faculty.email,
                                dept: topic.faculty.dept,
                                role: topic.faculty.role
                            },
                            topics: topic.topics,
                            requests: topic.requests
                        })),
                        outgoingRequests: approvedRequest ? [approvedRequest] : outgoingRequests
                    });
                }
                catch(err){
                    console.log(err);
                    return res.status(500).json({
                        message: "Error loading the dashboard in Faculty assignment phase"
                    });
                }
                
            case "IN_PROGRESS":
                //redo this too
                //send bin of the user in the response so that the frontend guy can do conditional rendering of the add update 
                try{
                    const projectarr=await BTP.find({
                        "students.student": user._id
                    })
                    .populate("students.student")
                    .populate("guide")
                    if(projectarr.length!==1){
                        return res.status(400).json({
                            message: "Either no project found or too many projects found"
                        });
                    }
                    const project=projectarr[0];
                    const evaluations=await BTPEvaluation.find({
                        projectRef: project._id
                    }).sort({time: 1});

                    const updates = project.updates.sort((a, b) => new Date(a.time) - new Date(b.time));

                    const formattedEvaluations = [];
                    let remainingUpdates = [...updates]; // mutable copy

                    for (let i = 0; i < evaluations.length; i++) {
                        const currEval = evaluations[i];
                        const nextEvalTime = evaluations[i + 1]?.time || null;
                        
                        // Get updates before the *next* evaluation (or after current if last)
                        const evalUpdates = remainingUpdates.filter(u => {
                            return u.time < (nextEvalTime || new Date(8640000000000000)); // max date if last
                        });

                        // Remove matched updates from remainingUpdates
                        remainingUpdates = remainingUpdates.filter(u => !evalUpdates.includes(u));

                        formattedEvaluations.push({
                            _id: currEval._id,
                            time: currEval.time,
                            remark: currEval.remark,
                            resources: currEval.resources,
                            updates: evalUpdates,
                            canstudentsee: currEval.canstudentsee,
                            marksgiven: currEval.canstudentsee
                            ? currEval.marksgiven.filter(m => m.student.toString() === user._id.toString())
                            : null
                        });
                    }
                
                    return res.status(200).json({
                        phase: "IP",
                        message: "Student Progress Dashboard",
                        project: {
                            name: project.name,
                            about: project.about,
                            studentbatch: project.studentbatch,
                            guide: {
                                name: project.guide.name,
                                email: project.guide.email
                            },
                            team: project.students.map(s => ({
                                _id: s.student._id,
                                name: s.student.name,
                                email: s.student.email
                            })),
                            evaluations: formattedEvaluations,
                            latestUpdates: remainingUpdates // updates after last evaluation
                        }
                    });
                    
                }
                catch(err){
                    console.log(err);
                    return res.status(500).json({
                        message: "Error loading the BTP dashboard in Progress phase"
                    });
                }

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
            const user=await UGStudentBTP.findOne({
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

//prolly add a feature where the invite expires after smtime
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
        const bin2stu=await UGStudentBTP.findOne({
            email: req.body.bin2email
        });
        const bin3stu=await UGStudentBTP.findOne({
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

export const rejectTeamRequest=async(req, res)=>{
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
        const currteam=teams.filter((team)=>{
            return team._id.toString()===req.body.teamid;
        });
        if(currteam.length===0){
            return res.status(400).json({
                message: "Cant reject a request u didnt get"
            });
        }
        if(currteam.length===1){
            if(currteam[0][binstrshort].approved){
                return res.status(400).json({
                    message: "Cant reject once u approved"
                });
            }
            const deletee=await BTPTeam.deleteOne({
                _id: req.body.teamid
            });
            if(deletee.deletedCount!==1){
                return res.status(500).json({
                    message: "Unable to reject the request"
                });
            }
            return res.status(201).json({
                message: "Successfully rejected the request"
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

//here if any of the req is already approved then we shouldnt allow them to send the request
export const facultyAssignmentRequest = async (req, res)=>{
    if(!req.body.docId||!req.body.topicId||!req.body.teamId){
        return res.status(400).json({
            message: "Invalid details sent"
        });
    }
    try{
        const {docId, topicId, teamId}=req.body;
        console.log(req.body);
        //checking if these ppl are already in any team
        const alreadyApproved = await BTPTopic.findOne({
            "requests.teamid": teamId,
            "requests.isapproved": true
        });
        if (alreadyApproved) {
            return res.status(400).json({
                message: "A faculty has already approved your request. You cannot send new ones."
            });
        }

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
        if(team.bin1.student.toString()!==req.user._id.toString()){
            return res.status(400).json({
                message: "Wrong Team Id"
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

export const addUpdatetoProject=async(req, res)=>{
    try{
        if(!req.body.update){
            return res.status(400).json({
                message: "Incomplete Request"
            });
        }
        const {update}=req.body;
        const project=await BTP.findOne({
            "students.student": req.user._id,
        });
        if (!project) {
            return res.status(404).json({
                message: "No project found for this student"
            });
        }
        project.updates.push({
            update,
            time: new Date()
        });
        await project.save();

        return res.status(200).json({
            message: "Update added successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            message: "Error adding update"
        });
    }
}
