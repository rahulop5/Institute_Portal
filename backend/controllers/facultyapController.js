import Faculty from "../models/Faculty.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import AP from "../models/AP.js";
import APEvaluation from "../models/APEvaluation.js";
import APRegistration from "../models/APRegistration.js";

// AP runs over 1 fixed semester; how many evaluations happen within it (and
// how many marks each is worth) is configurable per project via
// evaluationConfig - see the AP model.
const AP_SEMESTERS = 1;
const DEFAULT_EVALUATION_CONFIG = [{ maxMarks: 50 }, { maxMarks: 50 }];

function validateEvaluationConfig(evaluationConfig) {
  if (evaluationConfig === undefined) return DEFAULT_EVALUATION_CONFIG;
  if (!Array.isArray(evaluationConfig) || evaluationConfig.length === 0) return null;
  for (const slot of evaluationConfig) {
    if (typeof slot?.maxMarks !== "number" || slot.maxMarks <= 0) return null;
  }
  return evaluationConfig.map(slot => ({ maxMarks: slot.maxMarks }));
}

// Dashboard: Show Requests and Projects (no topics for AP)
export const getFacultyAPDashboard = async (req, res) => {
  const user = await Faculty.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "Error finding the faculty" });

  try {
    // 1. Fetch AP Requests for this faculty
    const facReqDoc = await APFacultyRequest.findOne({ faculty: user._id })
        .populate({
            path: "requests.student",
            populate: { path: "student", select: "name email rollNumber" }
        });

    let enrichedRequests = [];
    
    if (facReqDoc) {
        enrichedRequests = facReqDoc.requests
            .filter(r => !r.isapproved)  // only show pending requests
            .map((req) => {
                return {
                    studentRegId: req.student?._id,
                    student: req.student?.student || req.student,
                    proposalTitle: req.proposalTitle,
                    proposalText: req.proposalText,
                    isapproved: req.isapproved
                };
            });
    }

    // 2. Fetch Projects (Guided and Evaluated)
    const [guideProjects, evalProjects, evalRequestsRaw] = await Promise.all([
      AP.find({ guide: user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      AP.find({ "evaluators.evaluator": user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      APEvaluation.find({
        panelEvaluations: { $elemMatch: { evaluator: user._id, submitted: false } },
      }).populate({ path: "projectRef", populate: { path: "students.student" } })
    ]);

    const formatProject = (project) => ({
      _id: project._id,
      topic: project.name,
      projid: project._id.toString(),
      status: project.status,
      team: project.students.map((s) => s.student?.student?.name || "Unknown")
    });

    return res.status(200).json({
      email: user.email,
      phase: "ACTIVE",
      requests: enrichedRequests,
      guideproj: guideProjects.map(formatProject),
      evalproj: evalProjects.map(formatProject),
      evalreq: evalRequestsRaw.map(e => formatProject(e.projectRef)).filter(p => p)
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error loading AP dashboard" });
  }
};

export const approveAPRequest = async (req, res) => {
  try {
    const { studentId, evaluationConfig: rawEvaluationConfig } = req.body;
    // studentId here is the actual Student _id

    if (!studentId) return res.status(400).json({ message: "Student ID required" });

    const evaluationConfig = validateEvaluationConfig(rawEvaluationConfig);
    if (!evaluationConfig) {
      return res.status(400).json({ message: "Invalid evaluation config - each entry needs a positive maxMarks" });
    }

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    // Find the faculty request doc
    const facReqDoc = await APFacultyRequest.findOne({ faculty: fac._id });
    if (!facReqDoc) return res.status(400).json({ message: "No requests found" });

    // Find student registration
    const studentReg = await APRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Check if request exists
    const requestIndex = facReqDoc.requests.findIndex(r => 
        r.student.toString() === studentReg._id.toString()
    );
    if (requestIndex === -1) return res.status(400).json({ message: "Request not found" });

    // Verify student not already in a project
    if (studentReg.project) return res.status(400).json({ message: "Student already in an Additional Project" });

    // Get the proposal details from the request
    const requestData = facReqDoc.requests[requestIndex];

    // Create Project using the student's proposal
    const newapproj = new AP({
      name: requestData.proposalTitle,
      about: requestData.proposalText,
      studentbatch: "2025",
      students: [{ student: studentReg._id }],
      guide: fac._id,
      status: "active",
      evaluationConfig
    });
    const savedProj = await newapproj.save();

    // Update Registration
    studentReg.project = savedProj._id;
    studentReg.requests = []; 
    await studentReg.save();

    // Remove request from APFacultyRequest
    facReqDoc.requests.splice(requestIndex, 1);
    await facReqDoc.save();

    // Also remove any other pending requests this student has with other faculty
    await APFacultyRequest.updateMany(
      { "requests.student": studentReg._id },
      { $pull: { requests: { student: studentReg._id } } }
    );

    return res.status(201).json({ message: "AP request approved and project created" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error approving AP request" });
  }
};

export const rejectAPRequest = async (req, res) => {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: "Student ID required" });

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const studentReg = await APRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Remove from APFacultyRequest
    await APFacultyRequest.updateOne(
      { faculty: fac._id },
      { $pull: { requests: { student: studentReg._id } } }
    );

    // Update status in APRegistration to 'Rejected'
    await APRegistration.updateOne(
      { _id: studentReg._id, "requests.faculty": fac._id },
      { $set: { "requests.$.status": "Rejected" } }
    );

    return res.status(200).json({ message: "AP request rejected successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error rejecting AP request" });
  }
};

// Evaluation functions
export const evaluateAPProjectasGuide = async (req, res) => {
  try {
    const { projid, remark, marks } = req.body;
    if (!projid || !remark || !Array.isArray(marks)) return res.status(400).json({ message: "Invalid request" });

    const project = await AP.findById(projid)
      .populate("guide")
      .populate({ path: "students.student", select: "student" });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

    if (project.status === "completed") {
      return res.status(400).json({ message: "This Additional Project has already been completed. No more evaluations allowed." });
    }

    const evaluationConfig = project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG;
    const maxEvaluations = evaluationConfig.length * AP_SEMESTERS;

    // Check if max evaluations already reached - completion is now an explicit
    // guide action (see completeProject) rather than automatic, so a project
    // sits here at "all rounds evaluated, not yet marked complete" until then.
    const existingEvalCount = await APEvaluation.countDocuments({ projectRef: projid });
    if (existingEvalCount >= maxEvaluations) {
      return res.status(400).json({ message: `AP has reached the maximum number of evaluations (${maxEvaluations}). Mark the project complete instead of evaluating again.` });
    }

    const roundMaxMarks = evaluationConfig[existingEvalCount % evaluationConfig.length].maxMarks;
    for (const m of marks) {
      if (typeof m.guidemarks !== "number" || m.guidemarks < 0 || m.guidemarks > roundMaxMarks) {
        return res.status(400).json({ message: `Marks must be between 0 and ${roundMaxMarks} for this evaluation` });
      }
    }

    // No panel evaluators means there's nothing to pool - the guide's marks
    // are the final marks, so release them to the student immediately.
    const hasEvaluators = project.evaluators.length > 0;
    // marks[].studentId from the client is the Student _id, but marksgiven.student
    // must ref APRegistration - resolve each one against this project's own team.
    const marksgiven = marks.map(m => {
      const projectStudent = project.students.find(
        s => s.student?.student?.toString() === m.studentId
      );
      if (!projectStudent) {
        throw new Error(`Student ${m.studentId} is not on this project`);
      }
      return {
        student: projectStudent.student._id,
        guidemarks: m.guidemarks,
        totalgrade: hasEvaluators ? undefined : String(m.guidemarks),
      };
    });

    const newEval = new APEvaluation({
        projectRef: projid,
        time: new Date(),
        canstudentsee: !hasEvaluators,
        remark,
        marksgiven,
        maxMarks: roundMaxMarks,
        panelEvaluations: project.evaluators.map(e => ({ evaluator: e.evaluator, submitted: false }))
    });
    await newEval.save();

    const newEvalCount = existingEvalCount + 1;
    if (newEvalCount >= maxEvaluations) {
      return res.status(201).json({ message: `Evaluation submitted. All ${maxEvaluations} rounds done - release marks if needed, then mark the project complete.` });
    }

    return res.status(201).json({ message: "Evaluation submitted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error evaluating AP project" });
  }
};

export const evaluateAPProjectasEval = async (req, res) => {
    try {
        const { projid, evalId, panelmarks, remark } = req.body;
        if (!projid || !evalId || !remark || !Array.isArray(panelmarks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const evaluation = await APEvaluation.findOne({ _id: evalId, projectRef: projid }).populate("panelEvaluations.evaluator");
        if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "User not found" });

        const evalIndex = evaluation.panelEvaluations.findIndex(e => e.evaluator._id.toString() === user._id.toString());
        if (evalIndex === -1) return res.status(403).json({ message: "Not an evaluator" });

        const roundMaxMarks = evaluation.maxMarks ?? 50;
        for (const m of panelmarks) {
          if (typeof m.marks !== "number" || m.marks < 0 || m.marks > roundMaxMarks) {
            return res.status(400).json({ message: `Marks must be between 0 and ${roundMaxMarks} for this evaluation` });
          }
        }

        const project = await AP.findById(projid).populate({ path: "students.student", select: "student" });
        if (!project) return res.status(404).json({ message: "Project not found" });

        const resolvedPanelmarks = panelmarks.map(m => {
            const projectStudent = project.students.find(
                s => s.student?.student?.toString() === m.studentId
            );
            if (!projectStudent) {
                throw new Error(`Student ${m.studentId} is not on this project`);
            }
            return { student: projectStudent.student._id, marks: m.marks };
        });

        evaluation.panelEvaluations[evalIndex].submitted = true;
        evaluation.panelEvaluations[evalIndex].submittedAt = new Date();
        evaluation.panelEvaluations[evalIndex].remark = remark;
        evaluation.panelEvaluations[evalIndex].panelmarks = resolvedPanelmarks;
        await evaluation.save();
        return res.status(200).json({ message: "AP evaluation submitted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error evaluating AP project" });
    }
};

export const releaseAPEvaluation = async (req, res) => {
    try {
        const { projid, evalId, marks } = req.body;
        if (!projid || !evalId || !Array.isArray(marks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const project = await AP.findById(projid)
          .populate("guide")
          .populate({ path: "students.student", select: "student" });
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        const evaluation = await APEvaluation.findOne({ _id: evalId, projectRef: projid });
        if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

        if (evaluation.canstudentsee) {
            return res.status(400).json({ message: "This evaluation has already been sent to the student" });
        }

        const pendingEvaluators = evaluation.panelEvaluations.filter(e => !e.submitted);
        if (pendingEvaluators.length > 0) {
            return res.status(400).json({ message: `Waiting on ${pendingEvaluators.length} evaluator(s) to submit before this can be sent to the student` });
        }

        for (const m of marks) {
            const projectStudent = project.students.find(
                s => s.student?.student?.toString() === m.studentId
            );
            if (!projectStudent) {
                return res.status(400).json({ message: `Student ${m.studentId} is not on this project` });
            }
            const markEntry = evaluation.marksgiven.find(
                mg => mg.student.toString() === projectStudent.student._id.toString()
            );
            if (!markEntry) {
                return res.status(400).json({ message: `No guide marks found for this student - evaluate as guide first` });
            }
            markEntry.totalgrade = m.totalgrade;
        }

        evaluation.canstudentsee = true;
        await evaluation.save();
        return res.status(200).json({ message: "Evaluation sent to student" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error releasing AP evaluation" });
    }
};

export const assignEvaluator = async (req, res) => {
    try {
        const { projid, facultyEmail } = req.body;
        if (!projid || !facultyEmail) return res.status(400).json({ message: "Invalid request" });

        const project = await AP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status === "completed") {
            return res.status(400).json({ message: "Cannot assign evaluators to a completed project" });
        }

        const targetFaculty = await Faculty.findOne({ email: facultyEmail });
        if (!targetFaculty) return res.status(404).json({ message: "No faculty found with that email" });

        if (targetFaculty.email === project.guide.email) {
            return res.status(400).json({ message: "The guide cannot also be an evaluator" });
        }

        const alreadyAssigned = project.evaluators.some(e => e.evaluator.toString() === targetFaculty._id.toString());
        if (alreadyAssigned) {
            return res.status(400).json({ message: "This faculty is already an evaluator on this project" });
        }

        project.evaluators.push({ evaluator: targetFaculty._id });
        await project.save();

        await APEvaluation.updateMany(
            { projectRef: projid, canstudentsee: false, "panelEvaluations.evaluator": { $ne: targetFaculty._id } },
            { $push: { panelEvaluations: { evaluator: targetFaculty._id, submitted: false } } }
        );

        return res.status(201).json({ message: "Evaluator assigned" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error assigning evaluator" });
    }
};

export const removeEvaluator = async (req, res) => {
    try {
        const { projid, facultyEmail } = req.body;
        if (!projid || !facultyEmail) return res.status(400).json({ message: "Invalid request" });

        const project = await AP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status === "completed") {
            return res.status(400).json({ message: "Cannot remove evaluators from a completed project" });
        }

        const targetFaculty = await Faculty.findOne({ email: facultyEmail });
        if (!targetFaculty) return res.status(404).json({ message: "No faculty found with that email" });

        const isAssigned = project.evaluators.some(e => e.evaluator.toString() === targetFaculty._id.toString());
        if (!isAssigned) {
            return res.status(400).json({ message: "This faculty is not an evaluator on this project" });
        }

        project.evaluators = project.evaluators.filter(e => e.evaluator.toString() !== targetFaculty._id.toString());
        await project.save();

        await APEvaluation.updateMany(
            { projectRef: projid, canstudentsee: false },
            { $pull: { panelEvaluations: { evaluator: targetFaculty._id, submitted: false } } }
        );

        return res.status(200).json({ message: "Evaluator removed" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error removing evaluator" });
    }
};

// Lets the guide end an in-progress project before completion - e.g. the
// student left AP. Frees the student's registration (project: null) so
// they can propose to another faculty, and marks the project
// "discontinued" rather than deleting it, preserving whatever evaluations
// already happened.
export const stopGuiding = async (req, res) => {
    try {
        const { projid } = req.body;
        if (!projid) return res.status(400).json({ message: "Project ID required" });

        const project = await AP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status !== "active") {
            return res.status(400).json({ message: "This project is not currently active" });
        }

        project.status = "discontinued";
        await project.save();

        await APRegistration.updateMany(
            { _id: { $in: project.students.map(s => s.student) } },
            { $set: { project: null } }
        );

        return res.status(200).json({ message: "Guiding stopped for this project" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error stopping guiding" });
    }
};

export const completeProject = async (req, res) => {
    try {
        const { projid } = req.body;
        if (!projid) return res.status(400).json({ message: "Project ID required" });

        const project = await AP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status !== "active") {
            return res.status(400).json({ message: "This project is not currently active" });
        }

        const evaluationConfig = project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG;
        const maxEvaluations = evaluationConfig.length * AP_SEMESTERS;

        const evaluations = await APEvaluation.find({ projectRef: projid });
        if (evaluations.length < maxEvaluations) {
            return res.status(400).json({ message: `Only ${evaluations.length} of ${maxEvaluations} evaluations done - complete all evaluations first` });
        }
        if (evaluations.some(e => !e.canstudentsee)) {
            return res.status(400).json({ message: "Release marks to the student for the final evaluation before completing the project" });
        }

        project.status = "completed";
        await project.save();

        return res.status(200).json({ message: "Project marked complete" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error completing project" });
    }
};

export const viewAPProject = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await AP.findOne({ _id: req.query.projid, guide: user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");
        
        if (!project) return res.status(404).json({ message: "Project not found or you are not the guide" });

        const evaluations = await APEvaluation.find({ projectRef: project._id })
            .sort({ time: 1 })
            .populate("panelEvaluations.evaluator", "name email");

        return res.status(200).json({
            project: {
                 _id: project._id,
                 name: project.name,
                 about: project.about,
                 guide: project.guide,
                 status: project.status,
                 students: project.students.map(s => s.student?.student),
                 evaluators: project.evaluators.map(e => e.evaluator),
                 evaluations: evaluations,
                 updates: project.updates,
                 evaluationConfig: project.evaluationConfig
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error viewing AP project" });
    }
};

export const viewAPProjectEvaluator = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await AP.findOne({ _id: req.query.projid, "evaluators.evaluator": user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");

        if (!project) return res.status(404).json({ message: "Project not found or you are not an evaluator" });

        const evaluations = await APEvaluation.find({ projectRef: project._id }).sort({ time: 1 });

        return res.status(200).json({
            project: {
                 _id: project._id,
                 name: project.name,
                 about: project.about,
                 guide: project.guide,
                 status: project.status,
                 students: project.students.map(s => s.student?.student),
                 evaluators: project.evaluators.map(e => e.evaluator),
                 evaluations: evaluations,
                 updates: project.updates,
                 evaluationConfig: project.evaluationConfig
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error viewing AP project as evaluator" });
    }
};
