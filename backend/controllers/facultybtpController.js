import Faculty from "../models/Faculty.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPEvaluation from "../models/BTPEvaluation.js";
import BTPRegistration from "../models/BTPRegistration.js";
import HonorsRegistration from "../models/HonorsRegistration.js";

// BTP runs over 2 fixed semesters; how many evaluations happen within each
// semester (and how many marks each is worth) is configurable per project
// via evaluationConfig - see the BTP model.
const BTP_SEMESTERS = 2;
const DEFAULT_EVALUATION_CONFIG = [{ maxMarks: 50 }, { maxMarks: 50 }];

function validateEvaluationConfig(evaluationConfig) {
  if (evaluationConfig === undefined) return DEFAULT_EVALUATION_CONFIG;
  if (!Array.isArray(evaluationConfig) || evaluationConfig.length === 0) return null;
  for (const slot of evaluationConfig) {
    if (typeof slot?.maxMarks !== "number" || slot.maxMarks <= 0) return null;
  }
  return evaluationConfig.map(slot => ({ maxMarks: slot.maxMarks }));
}

// New Dashboard: Just show Topics/Requests and Projects
export const getFacultyBTPDashboard = async (req, res) => {
  const user = await Faculty.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "Error finding the faculty" });

  try {
    // 1. Fetch Topics and Requests
    const topics = await BTPTopic.findOne({ faculty: user._id })
        .populate({
            path: "requests.student",
            populate: { path: "student", select: "name email rollNumber" }
        });

    let enrichedRequests = [];
    let topicMap = new Map();
    
    if (topics) {
        topics.topics.forEach((t) => topicMap.set(t._id.toString(), t));
        enrichedRequests = topics.requests.map((req) => {
            return {
                ...req.toObject(),
                student: req.student?.student || req.student,
                topicDetails: topicMap.get(req.topic.toString()) || null
            };
        });
    }

    // 2. Fetch Projects (Guided and Evaluated)
    const [guideProjects, evalProjects, evalRequestsRaw] = await Promise.all([
      BTP.find({ guide: user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      BTP.find({ "evaluators.evaluator": user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      BTPEvaluation.find({
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
      topics: topics ? { ...topics.toObject(), requests: enrichedRequests } : null,
      guideproj: guideProjects.map(formatProject),
      evalproj: evalProjects.map(formatProject),
      evalreq: evalRequestsRaw.map(e => formatProject(e.projectRef)).filter(p => p)
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error loading dashboard" });
  }
};

export const addTopic = async (req, res) => {
  const user = await Faculty.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "Error finding the faculty" });
  
  if (!req.body.topic || !req.body.about) return res.status(400).json({ message: "No topic found" });
  
  const { topic, about } = req.body;
  const dept = user.dept;

  try {
    const existing = await BTPTopic.findOne({ faculty: user._id });
    if (existing) {
      existing.topics.push({ topic, about, dept });
      await existing.save();
    } else {
      const newtopic = new BTPTopic({
        faculty: user._id,
        topics: [{ topic, about, dept }],
      });
      await newtopic.save();
    }
    return res.status(201).json({ message: "Topics uploaded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error releasing the topics" });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { topicid, actualtid } = req.body;
    if (!topicid || !actualtid) return res.status(400).json({ message: "Id not mentioned" });
    
    const result = await BTPTopic.updateOne(
      { _id: actualtid },
      { $pull: { topics: { _id: topicid }, requests: { topic: topicid } } }
    );
    
    if (result.matchedCount === 0) return res.status(200).json({ message: "No Topic found" });
    return res.status(200).json({ message: "Deleted topic and requests successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting the topic" });
  }
};

export const approveTopicRequest = async (req, res) => {
  try {
    const { studentId, topicId, evaluationConfig: rawEvaluationConfig } = req.body;
    // studentId here is the actual Student _id

    if (!studentId || !topicId) return res.status(400).json({ message: "Student and topic required" });

    const evaluationConfig = validateEvaluationConfig(rawEvaluationConfig);
    if (!evaluationConfig) {
      return res.status(400).json({ message: "Invalid evaluation config - each entry needs a positive maxMarks" });
    }

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const factopicdoc = await BTPTopic.findOne({ faculty: fac._id, "topics._id": topicId });
    if (!factopicdoc) return res.status(400).json({ message: "Topic not found" });

    const topicSub = factopicdoc.topics.id(topicId);
    
    const studentReg = await BTPRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Check if request exists
    const requestIndex = factopicdoc.requests.findIndex(r => r.student.toString() === studentReg._id.toString() && r.topic.toString() === topicId);
    if (requestIndex === -1) return res.status(400).json({ message: "Request not found" });

    // Verify student not already in project
    if (studentReg.project) return res.status(400).json({ message: "Student already in a project" });

    // Mutual exclusion: check if student has an active Honors project
    const honorsReg = await HonorsRegistration.findOne({ student: studentReg.student, project: { $ne: null } });
    if (honorsReg) {
      return res.status(400).json({ message: "Student is already enrolled in an Honors project. Cannot approve for BTP." });
    }

    // Create Project
    const newbtpproj = new BTP({
      name: topicSub.topic,
      about: topicSub.about,
      studentbatch: "2025",
      students: [{ student: studentReg._id }],
      guide: fac._id,
      status: "active",
      evaluationConfig
    });
    const savedProj = await newbtpproj.save();

    // Update Registration
    studentReg.project = savedProj._id;
    studentReg.requests = []; 
    await studentReg.save();

    // Remove request from BTPTopic
    factopicdoc.requests.splice(requestIndex, 1);
    await factopicdoc.save();

    return res.status(201).json({ message: "Request approved and project created" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error approving request" });
  }
};

export const rejectTopicRequest = async (req, res) => {
  try {
    const { studentId, topicId, docid } = req.body;
    if (!studentId || !topicId || !docid) return res.status(400).json({ message: "Invalid Request" });

    const topicdoc = await BTPTopic.findOne({ _id: docid }).populate("faculty");
    if (req.user.email !== topicdoc.faculty.email) return res.status(403).json({ message: "Unauthorized" });

    const studentReg = await BTPRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Remove from BTPTopic requests
    await BTPTopic.updateOne(
      { _id: docid },
      { $pull: { requests: { student: studentReg._id, topic: topicId } } }
    );

    // Update status in BTPRegistration to 'Rejected'
    await BTPRegistration.updateOne(
      { _id: studentReg._id, "requests.topic": docid, "requests.subTopicId": topicId },
      { $set: { "requests.$.status": "Rejected" } }
    );

    return res.status(200).json({ message: "Request rejected successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error rejecting request" });
  }
};

// Evaluation functions
export const evaluateProjectasGuide = async (req, res) => {
  try {
    const { projid, remark, marks } = req.body;
    if (!projid || !remark || !Array.isArray(marks)) return res.status(400).json({ message: "Invalid request" });

    const project = await BTP.findById(projid)
      .populate("guide")
      .populate({ path: "students.student", select: "student" });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

    if (project.status === "completed") {
      return res.status(400).json({ message: "This BTP project has already been completed. No more evaluations allowed." });
    }

    const evaluationConfig = project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG;
    const maxEvaluations = evaluationConfig.length * BTP_SEMESTERS;

    // Check if max evaluations already reached - completion is now an explicit
    // guide action (see completeProject) rather than automatic, so a project
    // sits here at "all rounds evaluated, not yet marked complete" until then.
    const existingEvalCount = await BTPEvaluation.countDocuments({ projectRef: projid });
    if (existingEvalCount >= maxEvaluations) {
      return res.status(400).json({ message: `BTP has reached the maximum number of evaluations (${maxEvaluations}). Mark the project complete instead of evaluating again.` });
    }

    const roundMaxMarks = evaluationConfig[existingEvalCount % evaluationConfig.length].maxMarks;
    for (const m of marks) {
      if (typeof m.guidemarks !== "number" || m.guidemarks < 0 || m.guidemarks > roundMaxMarks) {
        return res.status(400).json({ message: `Marks must be between 0 and ${roundMaxMarks} for this evaluation` });
      }
    }

    // marks[].studentId from the client is the Student _id (viewProject/getFacultyBTPDashboard
    // both expose the flattened Student doc), but marksgiven.student must ref BTPRegistration -
    // resolve each one against this project's own team so a mark can't be attributed to a
    // student who isn't actually on the project.
    // No panel evaluators means there's nothing to pool - the guide's marks
    // are the final marks, so release them to the student immediately.
    const hasEvaluators = project.evaluators.length > 0;
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

    const newEval = new BTPEvaluation({
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
    return res.status(500).json({ message: "Error evaluating" });
  }
};

export const evaluateProjectasEval = async (req, res) => {
    try {
        const { projid, evalId, panelmarks, remark } = req.body;
        if (!projid || !evalId || !remark || !Array.isArray(panelmarks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        // evalId is required - a project can have several evaluation rounds,
        // and without it there's no way to tell which one this submission is for.
        const evaluation = await BTPEvaluation.findOne({ _id: evalId, projectRef: projid }).populate("panelEvaluations.evaluator");
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

        // panelmarks[].studentId from the client is the Student _id (same as guide
        // marks) but panelmarks.student must ref BTPRegistration - resolve against
        // the project's own team.
        const project = await BTP.findById(projid).populate({ path: "students.student", select: "student" });
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
        return res.status(200).json({ message: "Evaluation submitted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error evaluating" });
    }
};

export const releaseEvaluation = async (req, res) => {
    try {
        const { projid, evalId, marks } = req.body;
        if (!projid || !evalId || !Array.isArray(marks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const project = await BTP.findById(projid)
          .populate("guide")
          .populate({ path: "students.student", select: "student" });
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        const evaluation = await BTPEvaluation.findOne({ _id: evalId, projectRef: projid });
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
        return res.status(500).json({ message: "Error releasing evaluation" });
    }
};

export const assignEvaluator = async (req, res) => {
    try {
        const { projid, facultyEmail } = req.body;
        if (!projid || !facultyEmail) return res.status(400).json({ message: "Invalid request" });

        const project = await BTP.findById(projid).populate("guide");
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

        // Add this evaluator to any evaluation round still awaiting release,
        // so they can actually submit marks for work already in progress -
        // otherwise a newly-assigned evaluator would have no effect until
        // the next evaluation round is created.
        await BTPEvaluation.updateMany(
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

        const project = await BTP.findById(projid).populate("guide");
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

        // Drop their not-yet-submitted panel slot on any evaluation round
        // still awaiting release, so removal actually unblocks that round
        // instead of leaving it stuck waiting on someone who can no longer
        // submit. Marks they already submitted stay untouched.
        await BTPEvaluation.updateMany(
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
// student left BTP. Frees the student's registration (project: null) so
// they can request a new topic or join another program, and marks the
// project "discontinued" rather than deleting it, preserving whatever
// evaluations already happened.
export const stopGuiding = async (req, res) => {
    try {
        const { projid } = req.body;
        if (!projid) return res.status(400).json({ message: "Project ID required" });

        const project = await BTP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status !== "active") {
            return res.status(400).json({ message: "This project is not currently active" });
        }

        project.status = "discontinued";
        await project.save();

        await BTPRegistration.updateMany(
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

        const project = await BTP.findById(projid).populate("guide");
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        if (project.status !== "active") {
            return res.status(400).json({ message: "This project is not currently active" });
        }

        const evaluationConfig = project.evaluationConfig?.length ? project.evaluationConfig : DEFAULT_EVALUATION_CONFIG;
        const maxEvaluations = evaluationConfig.length * BTP_SEMESTERS;

        const evaluations = await BTPEvaluation.find({ projectRef: projid });
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

export const viewProject = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await BTP.findOne({ _id: req.query.projid, guide: user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");
        
        if (!project) return res.status(404).json({ message: "Project not found or you are not the guide" });

        const evaluations = await BTPEvaluation.find({ projectRef: project._id })
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
        return res.status(500).json({ message: "Error viewing project" });
    }
};

export const viewProjectEvaluator = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await BTP.findOne({ _id: req.query.projid, "evaluators.evaluator": user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");

        if (!project) return res.status(404).json({ message: "Project not found or you are not an evaluator" });

        const evaluations = await BTPEvaluation.find({ projectRef: project._id }).sort({ time: 1 });

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
        return res.status(500).json({ message: "Error viewing project as evaluator" });
    }
};
