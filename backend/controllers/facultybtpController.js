import Faculty from "../models/Faculty.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPTeam from "../models/BTPTeam.js";

//have to send the additional details to frontend
//remove err messages from catch blocks
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
                        phase: currstate.currentPhase,
                        email: user.email,
                        message: "Please upload your topics for BTP"
                    });
                }    
                return res.status(200).json({
                    phase: currstate.currentPhase,
                    email: user.email,
                    message: "You have uploaded the topics",
                    topics: topics
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

export const addTopic=async (req, res)=>{
    const user=await Faculty.findOne({
        email: req.user.email
    });
    if(!user){
        return res.status(404).json({
            message: "Error finding the faculty"
        });
    }
    if(!req.body.topic||!req.body.dept){
        return res.status(400).json({
            message: "No topic found"
        });
    }
    const {topic, dept}=req.body;
    if(!["CSE", "ECE", "MDS"].includes(dept)){
        return res.status(400).json({
            message: "Invalid Department"
        });
    }
    try{
        const existing = await BTPTopic.findOne({ faculty: user._id });
        if(existing){
            existing.topics.push({
                topic: topic,
                dept: dept
            });
            await existing.save();
        }
        else{
            const newtopic=new BTPTopic({
                faculty: user._id,
                topics: [{
                    topic: topic,
                    dept: dept
                }]
            });
            await newtopic.save();
        }
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

export const deleteTopic=async(req, res)=>{
    if(!req.body.topicid||!req.body.actualtid){
        return res.status(400).json({
            message: "Id not mentioned"
        });
    }
    try{
        const result=await BTPTopic.updateOne({
            _id: req.body.actualtid
        }, {
            $pull: {
                topics: {
                    _id: req.body.topicid
                }
            }
        });
        if(result.matchedCount===0){
            return res.status(200).json({
                message: "No Topic found"
            });
        }
        return res.status(200).json({
            message: "Deleted successfully"
        })
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error deleting the topic"
        })
    }
}

//delete other requests the team sent
// gotta set the limit on how many requests prof can accept
export const approveTopicRequest=async(req, res)=>{
    if(!req.body.topicid||!req.body.teamid){
        return res.status(400).json({
            message: "Invalid request"
        });
    }
    try{
        const {topicid, teamid}=req.body;
        const fac=await Faculty.findOne({
            email: req.user.email
        });
        if(!fac){
            return res.status(400).json({
                message: "No faculty found"
            });
        }
        const factopicdoc=await BTPTopic.findOne({
            faculty: fac._id
        });
        if(!factopicdoc){
            return res.status(400).json({
                message: "No topics found under this faculty"
            });
        }
        const topic=factopicdoc.topics.id(topicid);
        if(!topic){
            return res.status(400).json({
                message: "No topic found with that topic id"
            });
        }
        const request=factopicdoc.requests.find((request)=>{
            return request.teamid.toString()===teamid && request.topic.toString()===topicid
        });
        if(!request){
            return res.status(400).json({
                message: "No request found with that team id"
            });
        }
        if(request.isapproved){
            return res.status(400).json({
                message: "Already approved the request"
            });
        }
        request.isapproved=true;
        await factopicdoc.save();

        //uk deleting other pending requests from that team to other faculties or other topics
        const smth=await BTPTopic.updateMany(
            {
                $or: [
                    { "requests.teamid": teamid, faculty: { $ne: fac._id } },
                    { "requests.teamid": teamid, "requests.topic": { $ne: topicid } }
                ]
            },
            {
                $pull: {
                    requests: {
                        teamid: teamid,
                        topic: { $ne: topicid } 
                    }
                }
            }
        );

        //create an instance in the BTP projects to avoid massive computational tasks later
        const team=await BTPTeam.findOne({
            _id: teamid
        });
        const studentIds = [
            team.bin1.student,
            team.bin2.student,
            team.bin3.student
        ];
        const formattedStudents = studentIds.map(id => ({ student: id }));
        //add the other stuff later like give them option type shi after this phase
        const newbtpproj=new BTP({
            name: topic.topic,
            studentbatch: team.batch,
            students: formattedStudents,
            guide: fac._id
        });

        await newbtpproj.save();

        return res.status(201).json({
            message: "Successfully approved team request"
        });
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error approving the request"
        });
    }
}

//can there be multiple teams for a single topic??
export const rejectTopicRequest=async(req, res)=>{
    try{
        if(!req.body.teamid||!req.body.topicid||!req.body.docid){
            return res.status(400).json({
                message: "Invalid Request"
            });
        }
        const {teamid, topicid, docid}=req.body;
        const topicdoc=await BTPTopic.findOne({
            _id: docid
        }).populate("faculty");
        if(req.user.email!==topicdoc.faculty.email){
            return res.status(403).json({
                message: "Not allowed to do this"
            });
        }
        //here i could just do topicdoc.save after filtering it there itself
        //but that would compromise the security
        const result = await BTPTopic.updateOne(
            { _id: docid },
            {
                $pull: {
                    requests: {
                        teamid: teamid,
                        topic: topicid
                    }
                }
            }
        );
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                message: "Request not found or already rejected" 
            });
        }
        return res.status(200).json({
            message: "Request rejected successfully"
        });
    }
    catch(err){
        console.log(err);
        return res.status(err.status||500).json({
            message: err.message||"Error rejecting the request"
        });
    }
}

export const evaluateProjectGuide=async(req, res)=>{
    
}