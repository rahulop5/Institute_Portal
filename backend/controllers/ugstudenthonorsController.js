import { projectStartSemester, studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsTopic from "../models/HonorsTopic.js";
import Honors from "../models/Honors.js";
import HonorsEvaluation from "../models/HonorsEvaluation.js";
import Student from "../models/feedback/Student.js";
import { proposeTopic, visibleTopics, facultyDirectory, MESSAGE_MAX } from "./topicProposalController.js";
import { findOpenEnrollment, reviewFor } from "./enrollmentController.js";

// Max evaluations for Honors: 4 semesters × 2 evals = 8
const HONORS_MAX_EVALUATIONS = 8;

export const getHonorsDashboard = async (req, res) => {
    try {
        // 1. Find the Student record
        const student = await Student.findOne({ email: req.user.email });
        if (!student) {
            return res.status(404).json({ message: "Student not found in database" });
        }

        // 2. Mutual exclusion: check if student is enrolled in BTP
        const btpReg = await BTPRegistration.findOne({ student: student._id, project: { $ne: null } });
        if (btpReg) {
            return res.status(400).json({
                message: "You are already enrolled in a BTP project. You cannot participate in Honors."
            });
        }

        // 3. Try to find the Honors registration record
        const honorsUser = await HonorsRegistration.findOne({ student: student._id })
            .populate({
                path: 'project',
                populate: [
                    { path: 'guide', select: 'name email dept' },
                    { path: 'evaluators.evaluator', select: 'name email' },
                ]
            })
            .populate({
                 path: 'requests.topic',
                 select: 'faculty' 
            });

        // 4. Scenario A: Student is already in a Project
        if (honorsUser && honorsUser.project) {
            const project = honorsUser.project;
            const isCompleted = project.status === "completed";

            // Completed projects still show full progress/marks history to the
            // student - only the phase label and an informational message change,
            // marking the project complete is an explicit guide action, not a
            // reason to cut the student off from their own results.
            const evaluations = await HonorsEvaluation.find({ projectRef: project._id }).sort({ time: 1 });

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
                    maxMarks: currEval.maxMarks,
                    marksgiven: currEval.canstudentsee ? currEval.marksgiven.filter(m => m.student.toString() === honorsUser._id.toString()) : null
                });
            }

            // Re-fetch project to get student names
            const projectPopulated = await Honors.findById(project._id)
                .populate({
                    path: 'students.student',
                    populate: { path: 'student', select: 'name email rollNumber' }
                })
                .populate('guide', 'name email')
                .populate('evaluators.evaluator', 'name email');

            return res.status(200).json({
                email: student.email,
                phase: isCompleted ? "COMPLETED" : "IN_PROGRESS",
                message: isCompleted ? `Honors completed after ${evaluations.length} evaluations.` : undefined,
                project: {
                    _id: projectPopulated._id,
                    name: projectPopulated.name,
                    about: projectPopulated.about,
                    status: project.status,
                    studentbatch: projectPopulated.studentbatch,
                    guide: projectPopulated.guide,
                    evaluators: projectPopulated.evaluators.map(e => e.evaluator),
                    team: projectPopulated.students.map(s => ({
                        name: s.student?.student?.name || "Unknown",
                        email: s.student?.student?.email || "",
                        rollno: s.student?.student?.rollNumber || ""
                    })),
                    evaluations: formattedEvaluations,
                    startSemester: projectStartSemester(student.batch, project, evaluations),
                    latestUpdates: remainingUpdates,
                    evaluationConfig: projectPopulated.evaluationConfig
                }
            });
        }

        // Outside the semesters this program can start in: say so instead of
        // offering topics.
        const startProblem = startWindowProblem("honors", studentSemesterOn(student.batch, new Date()));
        if (startProblem) {
            return res.status(200).json({
                email: student.email,
                phase: "NOT_ELIGIBLE",
                message: `${startProblem} You are in Semester ${studentSemesterOn(student.batch, new Date())}.`,
            });
        }

        // 5. Scenario B: No Project. Show Topics.
        const topics = await HonorsTopic.find().populate('faculty', 'name email dept');
        
        const myRequests = honorsUser ? honorsUser.requests : [];

        const formattedTopics = topics.map(topicDoc => ({
            _id: topicDoc._id,
            faculty: topicDoc.faculty,
            topics: visibleTopics(topicDoc, honorsUser).map(t => {
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
            semester: studentSemesterOn(student.batch, new Date()),
            message: "Select a topic",
            topics: formattedTopics.filter(doc => doc.topics.length > 0),
            myRequests: myRequests,
            review: await reviewFor(student._id),
            faculty: await facultyDirectory()
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error loading Honors dashboard" });
    }
};

export const requestHonorsTopic = async (req, res) => {
    try {
        const { topicDocId, topicId, preference } = req.body;
        const message = (req.body.message || "").trim();
        if (!message) return res.status(400).json({ message: "Tell the faculty member about your interest in this topic." });
        if (message.length > MESSAGE_MAX) return res.status(400).json({ message: `Keep your message under ${MESSAGE_MAX} characters.` });
        if (!topicDocId || !topicId) {
            return res.status(400).json({ message: "Topic details required" });
        }

        // 1. Get Student
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });
        const requestStartProblem = startWindowProblem("honors", studentSemesterOn(student.batch, new Date()));
        if (requestStartProblem) return res.status(400).json({ message: requestStartProblem });

        // 2. Mutual exclusion check
        const btpReg = await BTPRegistration.findOne({ student: student._id, project: { $ne: null } });
        if (btpReg) {
            return res.status(400).json({
                message: "You are already enrolled in a BTP project. You cannot participate in Honors."
            });
        }

        // 3. Find or Create HonorsRegistration (Lazy Creation)
        let honorsUser = await HonorsRegistration.findOne({ student: student._id });
        if (!honorsUser) {
            honorsUser = new HonorsRegistration({ student: student._id });
        }

        // 4. Validation
        if (honorsUser.project) {
            return res.status(400).json({ message: "You are already in a project" });
        }

        if (await findOpenEnrollment(student._id)) {
            return res.status(400).json({ message: "A request of yours is already under review. Withdraw it first to request another topic." });
        }

        // Check duplicates
        const existingReq = honorsUser.requests.find(r => 
            r.topic.toString() === topicDocId && 
            r.subTopicId.toString() === topicId
        );
        if (existingReq) {
            return res.status(400).json({ message: "Already requested this topic" });
        }

        // 5. Add Request
        honorsUser.requests.push({
            topic: topicDocId,
            subTopicId: topicId,
            status: "Pending",
            message,
            preference: preference || (honorsUser.requests.length + 1)
        });
        await honorsUser.save();

        // 6. Update HonorsTopic
        const topicDoc = await HonorsTopic.findById(topicDocId);
        if (!topicDoc) return res.status(404).json({ message: "Topic document not found" });

        const subTopic = topicDoc.topics.id(topicId);
        if (!subTopic) return res.status(404).json({ message: "Specific topic not found" });

        topicDoc.requests.push({
            student: honorsUser._id,
            topic: topicId,
            isapproved: false,
            message,
            preference: preference || (honorsUser.requests.length)
        });
        await topicDoc.save();

        return res.status(200).json({ message: "Topic requested successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error requesting topic" });
    }
};

export const withdrawHonorsRequest = async (req, res) => {
    try {
        const { topicDocId, topicId } = req.body;
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Mutual exclusion check
        const btpReg = await BTPRegistration.findOne({ student: student._id, project: { $ne: null } });
        if (btpReg) {
            return res.status(400).json({
                message: "You are already enrolled in a BTP project. You cannot participate in Honors."
            });
        }

        const honorsUser = await HonorsRegistration.findOne({ student: student._id });
        if (!honorsUser) return res.status(404).json({ message: "No requests found" });

        // Remove from HonorsRegistration
        honorsUser.requests = honorsUser.requests.filter(r => 
            !(r.topic.toString() === topicDocId && r.subTopicId.toString() === topicId)
        );
        await honorsUser.save();

        // Remove from HonorsTopic
        const topicDoc = await HonorsTopic.findById(topicDocId);
        if (topicDoc) {
            topicDoc.requests = topicDoc.requests.filter(r => 
                !(r.student.toString() === honorsUser._id.toString() && r.topic.toString() === topicId)
            );
            // A withdrawn proposal of their own disappears entirely.
            const own = topicDoc.topics.id(topicId);
            if (own?.proposedBy?.equals(honorsUser._id)) own.deleteOne();
            await topicDoc.save();
        }

        return res.status(200).json({ message: "Request withdrawn successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error withdrawing request" });
    }
};

export const addUpdatetoHonorsProject = async (req, res) => {
    try {
        if (!req.body.update) return res.status(400).json({ message: "Incomplete Request" });
        const { update } = req.body;
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        // Mutual exclusion check
        const btpReg = await BTPRegistration.findOne({ student: student._id, project: { $ne: null } });
        if (btpReg) {
            return res.status(400).json({
                message: "You are already enrolled in a BTP project. You cannot participate in Honors."
            });
        }

        const honorsUser = await HonorsRegistration.findOne({ student: student._id });
        if (!honorsUser || !honorsUser.project) return res.status(400).json({ message: "No project assigned" });

        const project = await Honors.findById(honorsUser.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.status === "completed") {
            return res.status(400).json({ message: "This Honors project has already been completed" });
        }

        project.updates.push({ update, time: new Date() });
        await project.save();

        return res.status(200).json({ message: "Update added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error adding update" });
    }
};
export const proposeHonorsTopic = proposeTopic({
    program: "honors",
    label: "Honors",
    Topic: HonorsTopic,
    Registration: HonorsRegistration,
    OtherRegistration: BTPRegistration,
    otherLabel: "a BTP",
});
