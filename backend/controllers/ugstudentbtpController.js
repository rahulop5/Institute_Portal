import UGStudentBTP from "../models/UGStudentBTP.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPEvaluation from "../models/BTPEvaluation.js";
import Student from "../models/feedback/Student.js";

export const getBTPDashboard = async (req, res) => {
    try {
        // 1. Find the Student record from feedback DB
        const student = await Student.findOne({ email: req.user.email });
        if (!student) {
            return res.status(404).json({ message: "Student not found in database" });
        }

        // 2. Try to find the BTP-specific record (read-only, no create)
        const btpUser = await UGStudentBTP.findOne({ student: student._id })
            .populate({
                path: 'project',
                populate: [
                    { path: 'guide', select: 'name email dept' },
                    { path: 'evaluators.evaluator', select: 'name email' },
                    // Access nested student via population if needed, but we have the IDs
                ]
            })
            // Populate requests to check status
            .populate({
                 path: 'requests.topic',
                 select: 'faculty' 
            });

        // 3. Scenario A: Student is already in a Project
        if (btpUser && btpUser.project) {
            const project = btpUser.project;
            
            // Fetch evaluations
            const evaluations = await BTPEvaluation.find({ projectRef: project._id }).sort({ time: 1 });
            
            // Format updates and evaluations
            const updates = project.updates ? project.updates.sort((a, b) => new Date(a.time) - new Date(b.time)) : [];
            const formattedEvaluations = [];
            let remainingUpdates = [...updates];

            for (let i = 0; i < evaluations.length; i++) {
                const currEval = evaluations[i];
                const nextEvalTime = evaluations[i + 1]?.time || null;
                const evalUpdates = remainingUpdates.filter((u) => u.time < (nextEvalTime || new Date(8640000000000000)));
                remainingUpdates = remainingUpdates.filter((u) => !evalUpdates.includes(u));

                formattedEvaluations.push({
                    _id: currEval._id,
                    time: currEval.time,
                    remark: currEval.remark,
                    resources: currEval.resources,
                    updates: evalUpdates,
                    canstudentsee: currEval.canstudentsee,
                    marksgiven: currEval.canstudentsee ? currEval.marksgiven.filter(m => m.student.toString() === student._id.toString()) : null
                });
            }

            // Re-fetch project to get student names (efficient populate)
            const projectPopulated = await BTP.findById(project._id)
                .populate({
                    path: 'students.student',
                    populate: { path: 'student', select: 'name email rollNumber' }
                })
                .populate('guide', 'name email')
                .populate('evaluators.evaluator', 'name email');

            return res.status(200).json({
                email: student.email,
                phase: "IN_PROGRESS",
                project: {
                    _id: projectPopulated._id,
                    name: projectPopulated.name,
                    about: projectPopulated.about,
                    studentbatch: projectPopulated.studentbatch,
                    guide: projectPopulated.guide,
                    evaluators: projectPopulated.evaluators.map(e => e.evaluator),
                    team: projectPopulated.students.map(s => ({
                        name: s.student?.student?.name || "Unknown",
                        email: s.student?.student?.email || "",
                        rollno: s.student?.student?.rollNumber || ""
                    })),
                    evaluations: formattedEvaluations,
                    latestUpdates: remainingUpdates
                }
            });
        }

        // 4. Scenario B: No Project (or no BTP record yet). Show Topics.
        const topics = await BTPTopic.find().populate('faculty', 'name email dept');
        
        const myRequests = btpUser ? btpUser.requests : [];

        const formattedTopics = topics.map(topicDoc => ({
            _id: topicDoc._id,
            faculty: topicDoc.faculty,
            topics: topicDoc.topics.map(t => {
                // Find status of this specific topic in user's requests
                // matching logic: request.topic (Doc ID) == topicDoc._id AND request.subTopicId == t._id
                const req = myRequests.find(r => 
                    r.topic.toString() === topicDoc._id.toString() && 
                    r.subTopicId.toString() === t._id.toString()
                );
                return {
                    ...t.toObject(),
                    requestStatus: req ? req.status : null
                };
            })
        }));

        return res.status(200).json({
            email: student.email,
            phase: "TOPIC_SELECTION",
            message: "Select a topic",
            topics: formattedTopics,
            myRequests: myRequests
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error loading BTP dashboard" });
    }
};

export const requestTopic = async (req, res) => {
    try {
        const { topicDocId, topicId, preference } = req.body; 
        if (!topicDocId || !topicId) {
            return res.status(400).json({ message: "Topic details required" });
        }

        // 1. Get Student
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        // 2. Find or Create UGStudentBTP (Lazy Creation)
        let btpUser = await UGStudentBTP.findOne({ student: student._id });
        if (!btpUser) {
            btpUser = new UGStudentBTP({ student: student._id });
            // Don't save yet, valid later
        }

        // 3. Validation
        if (btpUser.project) {
            return res.status(400).json({ message: "You are already in a project" });
        }

        // Check duplicates
        const existingReq = btpUser.requests.find(r => 
            r.topic.toString() === topicDocId && 
            r.subTopicId.toString() === topicId
        );
        if (existingReq) {
            return res.status(400).json({ message: "Already requested this topic" });
        }

        // 4. Add Request
        btpUser.requests.push({
            topic: topicDocId,
            subTopicId: topicId,
            status: "Pending",
            preference: preference || (btpUser.requests.length + 1)
        });
        await btpUser.save(); // Creates the record if it didn't exist

        // 5. Update BTPTopic
        const topicDoc = await BTPTopic.findById(topicDocId);
        if (!topicDoc) return res.status(404).json({ message: "Topic document not found" });

        const subTopic = topicDoc.topics.id(topicId);
        if (!subTopic) return res.status(404).json({ message: "Specific topic not found" });

        topicDoc.requests.push({
            student: btpUser._id,
            topic: topicId,
            isapproved: false,
            preference: preference || (btpUser.requests.length)
        });
        await topicDoc.save();

        return res.status(200).json({ message: "Topic requested successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error requesting topic" });
    }
};

export const withdrawRequest = async (req, res) => {
    try {
        const { topicDocId, topicId } = req.body;
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const btpUser = await UGStudentBTP.findOne({ student: student._id });
        if (!btpUser) return res.status(404).json({ message: "No requests found" });

        // Remove from UGStudentBTP
        btpUser.requests = btpUser.requests.filter(r => 
            !(r.topic.toString() === topicDocId && r.subTopicId.toString() === topicId)
        );
        await btpUser.save();

        // Remove from BTPTopic
        const topicDoc = await BTPTopic.findById(topicDocId);
        if (topicDoc) {
            // Request in BTPTopic stores `student: UGStudentBTP_ID` and `topic: subTopicId`
            topicDoc.requests = topicDoc.requests.filter(r => 
                !(r.student.toString() === btpUser._id.toString() && r.topic.toString() === topicId)
            );
            await topicDoc.save();
        }

        return res.status(200).json({ message: "Request withdrawn successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error withdrawing request" });
    }
};

export const addUpdatetoProject = async (req, res) => {
    try {
        if (!req.body.update) return res.status(400).json({ message: "Incomplete Request" });
        const { update } = req.body;
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const btpUser = await UGStudentBTP.findOne({ student: student._id });
        if (!btpUser || !btpUser.project) return res.status(400).json({ message: "No project assigned" });

        const project = await BTP.findById(btpUser.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        project.updates.push({ update, time: new Date() });
        await project.save();

        return res.status(200).json({ message: "Update added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error adding update" });
    }
};
