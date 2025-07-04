import Faculty from "../models/Faculty.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPTeam from "../models/BTPTeam.js";

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


//gotta add the feature to reject the request
//also gotta set the limit on how many requests prof can accept
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
        request.isapproved=false;
        await factopicdoc.save();

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
