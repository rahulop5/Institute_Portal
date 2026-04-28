import APRegistration from "../models/APRegistration.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import AP from "../models/AP.js";
import APEvaluation from "../models/APEvaluation.js";
import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";

// Max evaluations for AP: 1 semester × 2 evals = 2
const AP_MAX_EVALUATIONS = 2;

export const getAPDashboard = async (req, res) => {
    try {
        // 1. Find the Student record
        const student = await Student.findOne({ email: req.user.email });
        if (!student) {
            return res.status(404).json({ message: "Student not found in database" });
        }

        // AP is independent — no mutual exclusion with BTP/Honors

        // 2. Try to find the AP registration record
        const apUser = await APRegistration.findOne({ student: student._id })
            .populate({
                path: 'project',
                populate: [
                    { path: 'guide', select: 'name email dept' },
                    { path: 'evaluators.evaluator', select: 'name email' },
                ]
            })
            .populate({
                 path: 'requests.faculty',
                 select: 'name email dept' 
            });

        // 3. Scenario A: Student is already in a Project
        if (apUser && apUser.project) {
            const project = apUser.project;

            // Check if project is completed
            const evaluations = await APEvaluation.find({ projectRef: project._id }).sort({ time: 1 });

            if (project.status === "completed") {
                return res.status(200).json({
                    email: student.email,
                    phase: "COMPLETED",
                    message: `Additional Project completed after ${evaluations.length} evaluations.`,
                    project: {
                        _id: project._id,
                        name: project.name,
                        about: project.about,
                        status: "completed"
                    }
                });
            }
            
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
                    marksgiven: currEval.canstudentsee ? currEval.marksgiven.filter(m => m.student.toString() === apUser._id.toString()) : null
                });
            }

            // Re-fetch project to get student names
            const projectPopulated = await AP.findById(project._id)
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
                    latestUpdates: (projectPopulated.updates || []).sort((a, b) => new Date(b.time) - new Date(a.time))
                }
            });
        }

        // 4. Scenario B: No Project. Show Faculty List.
        const facultyList = await Faculty.find({}, 'name email dept');
        
        const myRequests = apUser ? apUser.requests : [];

        // Mark which faculty the student has already requested
        const formattedFaculty = facultyList.map(fac => {
            const req = myRequests.find(r => 
                r.faculty._id ? r.faculty._id.toString() === fac._id.toString() : r.faculty.toString() === fac._id.toString()
            );
            return {
                _id: fac._id,
                name: fac.name,
                email: fac.email,
                dept: fac.dept,
                requestStatus: req ? req.status : null,
                proposalTitle: req ? req.proposalTitle : null
            };
        });

        return res.status(200).json({
            email: student.email,
            phase: "FACULTY_SELECTION",
            message: "Select a faculty and propose your project",
            faculty: formattedFaculty,
            myRequests: myRequests
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error loading AP dashboard" });
    }
};

export const requestFaculty = async (req, res) => {
    try {
        const { facultyId, proposalTitle, proposalText } = req.body; 
        if (!facultyId || !proposalTitle || !proposalText) {
            return res.status(400).json({ message: "Faculty ID, proposal title, and proposal text are required" });
        }

        // 1. Get Student
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        // 2. Verify faculty exists
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) return res.status(404).json({ message: "Faculty not found" });

        // 3. Find or Create APRegistration (Lazy Creation)
        let apUser = await APRegistration.findOne({ student: student._id });
        if (!apUser) {
            apUser = new APRegistration({ student: student._id });
        }

        // 4. Validation — only one AP at a time
        if (apUser.project) {
            return res.status(400).json({ message: "You are already in an Additional Project" });
        }

        // Check duplicate request to same faculty
        const existingReq = apUser.requests.find(r => 
            r.faculty.toString() === facultyId
        );
        if (existingReq) {
            return res.status(400).json({ message: "Already sent a request to this faculty" });
        }

        // 5. Add Request to APRegistration
        apUser.requests.push({
            faculty: facultyId,
            proposalTitle,
            proposalText,
            status: "Pending"
        });
        await apUser.save();

        // 6. Update APFacultyRequest (faculty-side inbox)
        let facReqDoc = await APFacultyRequest.findOne({ faculty: facultyId });
        if (!facReqDoc) {
            facReqDoc = new APFacultyRequest({ faculty: facultyId, requests: [] });
        }

        facReqDoc.requests.push({
            student: apUser._id,
            proposalTitle,
            proposalText,
            isapproved: false
        });
        await facReqDoc.save();

        return res.status(200).json({ message: "Request sent to faculty successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error requesting faculty" });
    }
};

export const withdrawRequest = async (req, res) => {
    try {
        const { facultyId } = req.body;
        if (!facultyId) return res.status(400).json({ message: "Faculty ID is required" });
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const apUser = await APRegistration.findOne({ student: student._id });
        if (!apUser) return res.status(404).json({ message: "No requests found" });

        // Remove from APRegistration
        apUser.requests = apUser.requests.filter(r => 
            r.faculty.toString() !== facultyId
        );
        await apUser.save();

        // Remove from APFacultyRequest
        const facReqDoc = await APFacultyRequest.findOne({ faculty: facultyId });
        if (facReqDoc) {
            facReqDoc.requests = facReqDoc.requests.filter(r => 
                r.student.toString() !== apUser._id.toString()
            );
            await facReqDoc.save();
        }

        return res.status(200).json({ message: "Request withdrawn successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error withdrawing request" });
    }
};

export const addUpdatetoAPProject = async (req, res) => {
    try {
        if (!req.body.update) return res.status(400).json({ message: "Incomplete Request" });
        const { update } = req.body;
        
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });

        const apUser = await APRegistration.findOne({ student: student._id });
        if (!apUser || !apUser.project) return res.status(400).json({ message: "No project assigned" });

        const project = await AP.findById(apUser.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.status === "completed") {
            return res.status(400).json({ message: "This Additional Project has already been completed" });
        }

        project.updates.push({ update, time: new Date() });
        await project.save();

        return res.status(200).json({ message: "Update added successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error adding update" });
    }
};
