import Faculty from "../models/Faculty.js";
import HonorsTopic from "../models/HonorsTopic.js";
import Honors from "../models/Honors.js";
import HonorsEvaluation from "../models/HonorsEvaluation.js";
import HonorsRegistration from "../models/HonorsRegistration.js";
import BTPRegistration from "../models/BTPRegistration.js";

// Max evaluations for Honors: 4 semesters × 2 evals = 8
const HONORS_MAX_EVALUATIONS = 8;

// Dashboard: Show Topics/Requests and Projects
export const getFacultyHonorsDashboard = async (req, res) => {
  const user = await Faculty.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "Error finding the faculty" });

  try {
    // 1. Fetch Topics and Requests
    const topics = await HonorsTopic.findOne({ faculty: user._id })
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
      Honors.find({ guide: user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      Honors.find({ "evaluators.evaluator": user._id }).populate({
          path: "students.student",
          populate: { path: "student", select: "name email" }
      }),
      HonorsEvaluation.find({
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
    return res.status(500).json({ message: "Error loading Honors dashboard" });
  }
};

export const addHonorsTopic = async (req, res) => {
  const user = await Faculty.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: "Error finding the faculty" });
  
  if (!req.body.topic || !req.body.about) return res.status(400).json({ message: "No topic found" });
  
  const { topic, about } = req.body;
  const dept = user.dept;

  try {
    const existing = await HonorsTopic.findOne({ faculty: user._id });
    if (existing) {
      existing.topics.push({ topic, about, dept });
      await existing.save();
    } else {
      const newtopic = new HonorsTopic({
        faculty: user._id,
        topics: [{ topic, about, dept }],
      });
      await newtopic.save();
    }
    return res.status(201).json({ message: "Honors topics uploaded successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error releasing the honors topics" });
  }
};

export const deleteHonorsTopic = async (req, res) => {
  try {
    const { topicid, actualtid } = req.body;
    if (!topicid || !actualtid) return res.status(400).json({ message: "Id not mentioned" });
    
    const result = await HonorsTopic.updateOne(
      { _id: actualtid },
      { $pull: { topics: { _id: topicid }, requests: { topic: topicid } } }
    );
    
    if (result.matchedCount === 0) return res.status(200).json({ message: "No Topic found" });
    return res.status(200).json({ message: "Deleted honors topic and requests successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error deleting the honors topic" });
  }
};

export const approveHonorsTopicRequest = async (req, res) => {
  try {
    const { studentId, topicId } = req.body; 
    // studentId here is the actual Student _id
    
    if (!studentId || !topicId) return res.status(400).json({ message: "Student and topic required" });

    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    const factopicdoc = await HonorsTopic.findOne({ faculty: fac._id, "topics._id": topicId });
    if (!factopicdoc) return res.status(400).json({ message: "Topic not found" });

    const topicSub = factopicdoc.topics.id(topicId);
    
    const studentReg = await HonorsRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Check if request exists
    const requestIndex = factopicdoc.requests.findIndex(r => r.student.toString() === studentReg._id.toString() && r.topic.toString() === topicId);
    if (requestIndex === -1) return res.status(400).json({ message: "Request not found" });

    // Verify student not already in project
    if (studentReg.project) return res.status(400).json({ message: "Student already in a project" });

    // Mutual exclusion: check if student has an active BTP project
    const btpReg = await BTPRegistration.findOne({ student: studentReg.student, project: { $ne: null } });
    if (btpReg) {
      return res.status(400).json({ message: "Student is already enrolled in a BTP project. Cannot approve for Honors." });
    }

    // Create Project
    const newhonorsproj = new Honors({
      name: topicSub.topic,
      about: topicSub.about,
      studentbatch: "2025",
      students: [{ student: studentReg._id }],
      guide: fac._id,
      status: "active"
    });
    const savedProj = await newhonorsproj.save();

    // Update Registration
    studentReg.project = savedProj._id;
    studentReg.requests = []; 
    await studentReg.save();

    // Remove request from HonorsTopic
    factopicdoc.requests.splice(requestIndex, 1);
    await factopicdoc.save();

    return res.status(201).json({ message: "Honors request approved and project created" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error approving honors request" });
  }
};

export const rejectHonorsTopicRequest = async (req, res) => {
  try {
    const { studentId, topicId, docid } = req.body;
    if (!studentId || !topicId || !docid) return res.status(400).json({ message: "Invalid Request" });

    const topicdoc = await HonorsTopic.findOne({ _id: docid }).populate("faculty");
    if (req.user.email !== topicdoc.faculty.email) return res.status(403).json({ message: "Unauthorized" });

    const studentReg = await HonorsRegistration.findOne({ student: studentId });
    if (!studentReg) return res.status(404).json({ message: "Student record not found" });

    // Remove from HonorsTopic requests
    await HonorsTopic.updateOne(
      { _id: docid },
      { $pull: { requests: { student: studentReg._id, topic: topicId } } }
    );

    // Update status in HonorsRegistration to 'Rejected'
    await HonorsRegistration.updateOne(
      { _id: studentReg._id, "requests.topic": docid, "requests.subTopicId": topicId },
      { $set: { "requests.$.status": "Rejected" } }
    );

    return res.status(200).json({ message: "Honors request rejected successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error rejecting honors request" });
  }
};

// Evaluation functions
export const evaluateHonorsProjectasGuide = async (req, res) => {
  try {
    const { projid, remark, marks } = req.body;
    if (!projid || !remark || !Array.isArray(marks)) return res.status(400).json({ message: "Invalid request" });

    const project = await Honors.findById(projid)
      .populate("guide")
      .populate({ path: "students.student", select: "student" });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

    if (project.status === "completed") {
      return res.status(400).json({ message: "This Honors project has already been completed. No more evaluations allowed." });
    }

    // Check if max evaluations already reached
    const existingEvalCount = await HonorsEvaluation.countDocuments({ projectRef: projid });
    if (existingEvalCount >= HONORS_MAX_EVALUATIONS) {
      project.status = "completed";
      await project.save();
      return res.status(400).json({ message: "Honors has reached the maximum number of evaluations (8). Project is now completed." });
    }

    // No panel evaluators means there's nothing to pool - the guide's marks
    // are the final marks, so release them to the student immediately.
    const hasEvaluators = project.evaluators.length > 0;
    // marks[].studentId from the client is the Student _id, but marksgiven.student
    // must ref HonorsRegistration - resolve each one against this project's own team.
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

    const newEval = new HonorsEvaluation({
        projectRef: projid,
        time: new Date(),
        canstudentsee: !hasEvaluators,
        remark,
        marksgiven,
        panelEvaluations: project.evaluators.map(e => ({ evaluator: e.evaluator, submitted: false }))
    });
    await newEval.save();

    // Check if we've now reached the max evaluations → auto-complete
    const newEvalCount = existingEvalCount + 1;
    if (newEvalCount >= HONORS_MAX_EVALUATIONS) {
      project.status = "completed";
      await project.save();
      return res.status(201).json({ message: `Evaluation submitted. Honors completed after ${newEvalCount} evaluations.` });
    }

    return res.status(201).json({ message: "Evaluation submitted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error evaluating honors project" });
  }
};

export const evaluateHonorsProjectasEval = async (req, res) => {
    try {
        const { projid, evalId, panelmarks, remark } = req.body;
        if (!projid || !evalId || !remark || !Array.isArray(panelmarks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const evaluation = await HonorsEvaluation.findOne({ _id: evalId, projectRef: projid }).populate("panelEvaluations.evaluator");
        if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "User not found" });

        const evalIndex = evaluation.panelEvaluations.findIndex(e => e.evaluator._id.toString() === user._id.toString());
        if (evalIndex === -1) return res.status(403).json({ message: "Not an evaluator" });

        const project = await Honors.findById(projid).populate({ path: "students.student", select: "student" });
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
        return res.status(200).json({ message: "Honors evaluation submitted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error evaluating honors project" });
    }
};

export const releaseHonorsEvaluation = async (req, res) => {
    try {
        const { projid, evalId, marks } = req.body;
        if (!projid || !evalId || !Array.isArray(marks)) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const project = await Honors.findById(projid)
          .populate("guide")
          .populate({ path: "students.student", select: "student" });
        if (!project) return res.status(404).json({ message: "Project not found" });
        if (project.guide.email !== req.user.email) return res.status(403).json({ message: "Unauthorized" });

        const evaluation = await HonorsEvaluation.findOne({ _id: evalId, projectRef: projid });
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
        return res.status(500).json({ message: "Error releasing honors evaluation" });
    }
};

export const assignEvaluator = async (req, res) => {
    try {
        const { projid, facultyEmail } = req.body;
        if (!projid || !facultyEmail) return res.status(400).json({ message: "Invalid request" });

        const project = await Honors.findById(projid).populate("guide");
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

        await HonorsEvaluation.updateMany(
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

        const project = await Honors.findById(projid).populate("guide");
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

        await HonorsEvaluation.updateMany(
            { projectRef: projid, canstudentsee: false },
            { $pull: { panelEvaluations: { evaluator: targetFaculty._id, submitted: false } } }
        );

        return res.status(200).json({ message: "Evaluator removed" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error removing evaluator" });
    }
};

export const viewHonorsProject = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await Honors.findOne({ _id: req.query.projid, guide: user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");
        
        if (!project) return res.status(404).json({ message: "Project not found or you are not the guide" });

        const evaluations = await HonorsEvaluation.find({ projectRef: project._id })
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
                 updates: project.updates
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: "Error viewing honors project" });
    }
};

export const viewHonorsProjectEvaluator = async (req, res) => {
    try {
        const user = await Faculty.findOne({ email: req.user.email });
        if (!user) return res.status(403).json({ message: "Unauthorized" });

        const project = await Honors.findOne({ _id: req.query.projid, "evaluators.evaluator": user._id })
            .populate({ path: "students.student", populate: { path: "student", select: "name email rollNumber" } })
            .populate("guide", "name email")
            .populate("evaluators.evaluator", "name email");

        if (!project) return res.status(404).json({ message: "Project not found or you are not an evaluator" });

        const evaluations = await HonorsEvaluation.find({ projectRef: project._id }).sort({ time: 1 });

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
        return res.status(500).json({ message: "Error viewing honors project as evaluator" });
    }
};
