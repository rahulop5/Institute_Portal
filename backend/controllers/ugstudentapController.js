import { projectStartSemester, studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";
import APRegistration from "../models/APRegistration.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import AP from "../models/AP.js";
import APEvaluation from "../models/APEvaluation.js";
import Faculty from "../models/Faculty.js";
import { findOpenEnrollment, reviewFor } from "./enrollmentController.js";
import Student from "../models/feedback/Student.js";
import ProgramChangeRequest from "../models/ProgramChangeRequest.js";
import { MAX_AP_TEAM, apTeamBlock, resolveTeammates, teamInvitesFor, addTeammateProblem } from "./apTeamController.js";
import { notifyProgramChangeReceived } from "../utils/programChangeMailer.js";

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
            })
            .populate({ path: 'requests.teammates', select: 'name email rollNumber' });

        // 3. Scenario A: Student is already in a Project
        if (apUser && apUser.project) {
            const project = apUser.project;
            const isCompleted = project.status === "completed";

            // Completed projects still show full progress/marks history to the
            // student - only the phase label and an informational message change,
            // marking the project complete is an explicit guide action, not a
            // reason to cut the student off from their own results.
            const evaluations = await APEvaluation.find({ projectRef: project._id }).sort({ time: 1 }).populate("panelEvaluations.evaluator", "name");

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
                    // guide remark and resources are part of the result: hidden until the round is released
                    remark: currEval.canstudentsee ? currEval.remark : null,
                    resources: currEval.canstudentsee ? currEval.resources : null,
                    updates: evalUpdates,
                    canstudentsee: currEval.canstudentsee,
                    maxMarks: currEval.maxMarks,
                    marksgiven: currEval.canstudentsee ? currEval.marksgiven.filter(m => m.student.toString() === apUser._id.toString()) : null,
                    // Released rounds only: what each evaluator gave this student and wrote.
                    panel: currEval.canstudentsee
                        ? currEval.panelEvaluations.filter(pe => pe.submitted).map(pe => ({
                            name: pe.evaluator?.name || "Evaluator",
                            marks: pe.panelmarks.find(m => m.student.toString() === apUser._id.toString())?.marks ?? null,
                            remark: pe.remark || "",
                            at: pe.submittedAt || null,
                        }))
                        : null
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
                phase: isCompleted ? "COMPLETED" : "IN_PROGRESS",
                message: isCompleted ? `Additional Project completed after ${evaluations.length} evaluations.` : undefined,
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
                    latestUpdates: (projectPopulated.updates || []).sort((a, b) => new Date(b.time) - new Date(a.time)),
                    evaluationConfig: projectPopulated.evaluationConfig,
                    // Adding a teammate after approval (before the first evaluation).
                    maxTeam: MAX_AP_TEAM,
                    addTeammateProblem: await addTeammateProblem(projectPopulated),
                    teamRequest: await (async () => {
                        const open = await ProgramChangeRequest.findOne({ type: "team_add", project: project._id, status: { $in: ["pending_faculty", "pending_ugprojects", "pending_assistantdean"] } })
                            .populate("newMember", "name email")
                            .populate("student", "name");
                        return open
                            ? { _id: open._id, status: open.status, newMember: open.newMember ? { name: open.newMember.name, email: open.newMember.email } : null, requestedBy: open.student?.name, mine: open.student?._id?.equals(student._id) }
                            : null;
                    })()
                }
            });
        }

        // Outside the semesters an AP can be taken in: say so instead of
        // offering faculty.
        const semester = studentSemesterOn(student.batch, new Date());
        const startProblem = startWindowProblem("ap", semester);
        if (startProblem) {
            return res.status(200).json({
                email: student.email,
                phase: "NOT_ELIGIBLE",
                message: `${startProblem} You are in Semester ${semester}.`,
            });
        }

        // 4. Scenario B: No Project. Show Faculty List.
        const facultyList = await Faculty.find({}, 'name email dept interests').sort({ name: 1 });
        
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
                interests: fac.interests || [],
                requestStatus: req ? req.status : null,
                proposalTitle: req ? req.proposalTitle : null
            };
        });

        return res.status(200).json({
            email: student.email,
            phase: "FACULTY_SELECTION",
            message: "Select a faculty and propose your project",
            faculty: formattedFaculty,
            review: await reviewFor(student._id, ["ap"]),
            myRequests: myRequests,
            // Proposals by others that list this student as a teammate.
            teamInvites: await teamInvitesFor(student._id),
            maxTeam: MAX_AP_TEAM
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
        const requestStartProblem = startWindowProblem("ap", studentSemesterOn(student.batch, new Date()));
        if (requestStartProblem) return res.status(400).json({ message: requestStartProblem });

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

        if (await findOpenEnrollment(student._id, ["ap"])) {
            return res.status(400).json({ message: "A proposal of yours is already under review. Withdraw it first to propose another." });
        }
        // On someone else's team proposal (or waiting to join a team) already.
        const selfBlock = await apTeamBlock(student._id);
        if (selfBlock) return res.status(400).json({ message: `You ${selfBlock.replace(/^is /, "are ")}.` });

        // Optional teammates, by email.
        const team = await resolveTeammates(req.body.teammates, student);
        if (team.error) return res.status(400).json({ message: team.error });
        const teammates = team.students.map((s) => s._id);

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
            teammates,
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
            teammates,
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

// A team member asks to add a teammate after approval, before the first
// evaluation. It goes to the guide, then UG Projects and the Assistant Dean;
// the new member joins the project once all three approve.
export const addTeammate = async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.user.email });
        if (!student) return res.status(404).json({ message: "Student not found" });
        const apUser = await APRegistration.findOne({ student: student._id });
        if (!apUser?.project) return res.status(400).json({ message: "You don't have an Additional Project yet" });
        const project = await AP.findById(apUser.project);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const problem = await addTeammateProblem(project);
        if (problem) return res.status(400).json({ message: problem });
        const team = await resolveTeammates([req.body.email], student, project.students.length);
        if (team.error) return res.status(400).json({ message: team.error });
        if (!team.students.length) return res.status(400).json({ message: "Enter your teammate's email" });
        const [newMember] = team.students;

        const request = await ProgramChangeRequest.create({
            student: student._id,
            program: "ap",
            type: "team_add",
            project: project._id,
            projectModel: "AP",
            guide: project.guide,
            newMember: newMember._id,
            reason: `Add ${newMember.name} to the team`,
            status: "pending_faculty",
            history: [{ role: "Student", email: student.email, action: "submitted" }],
        });
        notifyProgramChangeReceived(request, "pending_faculty");
        return res.status(201).json({ message: "Sent to your guide for approval" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error requesting a teammate" });
    }
};
