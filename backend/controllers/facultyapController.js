import Faculty from "../models/Faculty.js";
import APFacultyRequest from "../models/APFacultyRequest.js";
import AP from "../models/AP.js";
import APEvaluation from "../models/APEvaluation.js";
import APRegistration from "../models/APRegistration.js";

// Max evaluations for AP: 1 semester × 2 evals = 2
const AP_MAX_EVALUATIONS = 2;

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
    const { studentId } = req.body; 
    // studentId here is the actual Student _id
    
    if (!studentId) return res.status(400).json({ message: "Student ID required" });

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
      status: "active"
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

    const project = await AP.findById(projid).populate("guide");
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

    if (project.status === "completed") {
      return res.status(400).json({ message: "This Additional Project has already been completed. No more evaluations allowed." });
    }

    // Check if max evaluations already reached
    const existingEvalCount = await APEvaluation.countDocuments({ projectRef: projid });
    if (existingEvalCount >= AP_MAX_EVALUATIONS) {
      // Auto-complete the project
      project.status = "completed";
      await project.save();
      return res.status(400).json({ message: "AP has reached the maximum number of evaluations (2). Project is now completed." });
    }

    const newEval = new APEvaluation({
        projectRef: projid,
        time: new Date(),
        canstudentsee: false,
        remark,
        marksgiven: marks.map(m => ({ student: m.studentId, guidemarks: m.guidemarks })),
        panelEvaluations: project.evaluators.map(e => ({ evaluator: e.evaluator, submitted: false }))
    });
    await newEval.save();

    // Check if we've now reached the max evaluations → auto-complete
    const newEvalCount = existingEvalCount + 1;
    if (newEvalCount >= AP_MAX_EVALUATIONS) {
      project.status = "completed";
      await project.save();
      return res.status(201).json({ message: `Evaluation submitted. AP completed after ${newEvalCount} evaluations.` });
    }

    return res.status(201).json({ message: "Evaluation submitted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error evaluating AP project" });
  }
};

export const evaluateAPProjectasEval = async (req, res) => {
    try {
        const { projid, panelmarks, remark } = req.body;
        const evaluation = await APEvaluation.findOne({ projectRef: projid }).populate("panelEvaluations.evaluator");
        if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "User not found" });

        const evalIndex = evaluation.panelEvaluations.findIndex(e => e.evaluator._id.toString() === user._id.toString());
        if (evalIndex === -1) return res.status(403).json({ message: "Not an evaluator" });

        evaluation.panelEvaluations[evalIndex].submitted = true;
        evaluation.panelEvaluations[evalIndex].remark = remark;
        await evaluation.save();
        return res.status(200).json({ message: "AP evaluation submitted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error evaluating AP project" });
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
                 updates: project.updates
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
                 updates: [] 
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error viewing AP project as evaluator" });
    }
};
