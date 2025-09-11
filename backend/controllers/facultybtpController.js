import Faculty from "../models/Faculty.js";
import BTPSystemState from "../models/BTPSystemState.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPEvaluation from "../models/BTPEvaluation.js";

//have to send the additional details to frontend
//remove err messages from catch blocks

const data = {
  email: "asha.iyer@example.com",
  guideproj: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
  evalproj: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
  evalreq: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
};

const data2 = {
  email: "asha.iyer@example.com",
  guideproj: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
  evalproj: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
  evalreq: [
    {
      _id: "smth",
      topic: "Assistive Technologies for Accessibility",
      projid: "T1000202",
      team: ["stu1", "stu2", "stu3"],
    },
    //...etc
  ],
};

export const getFacultyBTPDashboard = async (req, res) => {
  const user = await Faculty.findOne({
    email: req.user.email,
  });
  if (!user) {
    return res.status(404).json({
      message: "Error finding the faculty",
    });
  }
  try {
    if (!req.query.batch) {
      return res.status(400).json({
        message: "batch not found in the request",
      });
    }
    const currstate = await BTPSystemState.findOne({
      studentbatch: req.query.batch,
    });
    if (!currstate) {
      return res.status(400).json({
        message: "Invalid batch",
      });
    }
    switch (currstate.currentPhase) {
      case "NOT_STARTED":
      case "TEAM_FORMATION":
      case "FACULTY_ASSIGNMENT":
        //dont send all the details of students
        const topics = await BTPTopic.findOne({ faculty: user._id }).populate({
          path: "requests.teamid",
          populate: [
            { path: "bin1.student", model: "UGStudentBTP" },
            { path: "bin2.student", model: "UGStudentBTP" },
            { path: "bin3.student", model: "UGStudentBTP" },
          ],
        });

        if (!topics) {
          return res.status(200).json({
            phase: currstate.currentPhase,
            email: user.email,
            message: "Please upload your topics for BTP",
          });
        }

        const topicMap = new Map();
        topics.topics.forEach((t) => {
          topicMap.set(t._id.toString(), t);
        });

        function filterStudent(student) {
          if (!student) return null;
          return {
            name: student.name,
            email: student.email,
            rollno: student.rollno,
          };
        }

        const enrichedRequests = topics.requests.map((req) => {
          const team = req.teamid?.toObject?.() || {};

          if (team.bin1?.student) {
            team.bin1.student = filterStudent(team.bin1.student);
          }
          if (team.bin2?.student) {
            team.bin2.student = filterStudent(team.bin2.student);
          }
          if (team.bin3?.student) {
            team.bin3.student = filterStudent(team.bin3.student);
          }

          return {
            ...req.toObject(),
            teamid: team,
            topicDetails: topicMap.get(req.topic.toString()) || null,
          };
        });

        return res.status(200).json({
          phase: currstate.currentPhase,
          email: user.email,
          message: "You have uploaded the topics",
          topics: {
            ...topics.toObject(),
            requests: enrichedRequests,
          },
        });

      case "IN_PROGRESS":
        //can do this later
        const facultyId = user._id;

        const [guideProjects, evalProjects, evalRequestsRaw] =
          await Promise.all([
            // Projects guided by the faculty
            BTP.find({ guide: facultyId })
              .populate("students.student")
              .select("name studentbatch students"),

            // Projects where faculty is an evaluator
            BTP.find({ "evaluators.evaluator": facultyId })
              .populate("students.student")
              .select("name studentbatch students"),

            // Evaluations where this faculty has not submitted yet
            BTPEvaluation.find({
              panelEvaluations: {
                $elemMatch: {
                  evaluator: facultyId,
                  submitted: false,
                },
              },
            })
              .populate({
                path: "projectRef",
                populate: { path: "students.student" },
              })
              .select("projectRef"),
          ]);

        const formatProject = (project) => ({
          _id: project._id,
          topic: project.name,
          projid: project._id.toString(), // or custom T10002xx format if exists
          team: project.students.map((s) => s.student.name),
        });

        // Extract projects from evaluations (for evalreq)
        const evalReqProjects = evalRequestsRaw
          .map((e) => e.projectRef)
          .filter((p) => p) // skip if no populated project
          .map(formatProject);

        return res.status(200).json({
          phase: currstate.currentPhase,
          email: user.email,
          guideproj: guideProjects.map(formatProject),
          evalproj: evalProjects.map(formatProject),
          evalreq: evalReqProjects,
        });

      case "COMPLETED":
        break;

      default:
        return res.status(500).json({
          message: "Invalid Phase",
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error loading the dashboard",
    });
  }
};

export const viewProject = async (req, res) => {
  try {
    if (!req.query.projid) {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
    const user = await Faculty.findOne({
      email: req.user.email,
    });
    if (!user) {
      return res.status(404).json({
        message: "Error finding the faculty",
      });
    }
    const project = await BTP.findOne({
      _id: req.query.projid,
      guide: user._id,
    })
      .populate("students.student")
      .populate("guide")
      .populate("evaluators.evaluator");

    if (!project) {
      return res.status(404).json({
        message: "Cant Find Project",
      });
    }
    const evaluations = await BTPEvaluation.find({
      projectRef: project._id,
    }).sort({ time: 1 });

    const updates = project.updates.sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );

    const formattedEvaluations = [];
    let remainingUpdates = [...updates]; // mutable copy

    for (let i = 0; i < evaluations.length; i++) {
      const currEval = evaluations[i];
      const nextEvalTime = evaluations[i + 1]?.time || null;

      // Get updates before the *next* evaluation (or after current if last)
      const evalUpdates = remainingUpdates.filter((u) => {
        return u.time < (nextEvalTime || new Date(8640000000000000)); // max date if last
      });

      // Remove matched updates from remainingUpdates
      remainingUpdates = remainingUpdates.filter(
        (u) => !evalUpdates.includes(u)
      );

      formattedEvaluations.push({
        _id: currEval._id,
        time: currEval.time,
        remark: currEval.remark,
        resources: currEval.resources,
        updates: evalUpdates,
        canstudentsee: currEval.canstudentsee,
        marksgiven: currEval.canstudentsee
          ? currEval.marksgiven.filter(
              (m) => m.student.toString() === user._id.toString()
            )
          : null,
      });
    }

    return res.status(200).json({
      email: user.email,
      phase: "IP",
      message: "Student Progress Dashboard",
      //hardcoded start
      nextEvalDate: {
        month: "March",
        day: 15,
      },
      currentScore: {
        value: 48,
        outOf: 50,
      },
      //hardcoded end
      project: {
        id: project._id,
        name: project.name,
        about: project.about,
        studentbatch: project.studentbatch,
        guide: {
          name: project.guide.name,
          email: project.guide.email,
        },
        evaluators: project.evaluators.map((e) => ({
          name: e.evaluator.name,
          email: e.evaluator.email,
        })),
        team: project.students.map((s) => ({
          _id: s.student._id,
          name: s.student.name,
          email: s.student.email,
          rollno: s.student.rollno,
          bin: s.student.bin
        })),
        evaluations: formattedEvaluations,
        latestUpdates: project.updates // updates after last evaluation
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error loading the BTP dashboard in Progress phase",
    });
  }
};

export const viewProjectEvaluator = async (req, res) => {
  try {
    if (!req.query.projid) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    // Find the evaluator user
    const evaluatorUser = await Faculty.findOne({ email: req.user.email });
    if (!evaluatorUser) {
      return res.status(404).json({ message: "Error finding the faculty" });
    }

    // Fetch the project by projid only
    const project = await BTP.findOne({ _id: req.query.projid })
      .populate("students.student")
      .populate("guide")
      .populate("evaluators.evaluator");

    if (!project) {
      return res.status(404).json({ message: "Can't Find Project" });
    }

    // Check if this faculty is an evaluator for the project
    const isEvaluator = project.evaluators.some(
      (e) => e.evaluator._id.toString() === evaluatorUser._id.toString()
    );
    if (!isEvaluator) {
      return res.status(403).json({ message: "You are not an evaluator for this project" });
    }

    // Get evaluations (but no updates)
    const evaluations = await BTPEvaluation.find({
      projectRef: project._id,
    }).sort({ time: 1 });

    const formattedEvaluations = evaluations.map((currEval) => ({
      _id: currEval._id,
      time: currEval.time,
      remark: currEval.remark,
      resources: currEval.resources,
      canstudentsee: currEval.canstudentsee,
      marksgiven: currEval.canstudentsee
        ? currEval.marksgiven.filter(
            (m) => m.student.toString() === evaluatorUser._id.toString()
          )
        : null,
    }));

    return res.status(200).json({
      email: evaluatorUser.email,
      bin: evaluatorUser.bin,
      phase: "IP",
      message: "Evaluator Project View",
      //hardcoded start
      nextEvalDate: {
        month: "March",
        day: 15,
      },
      currentScore: {
        value: 48,
        outOf: 50,
      },
      //hardcoded end
      project: {
        id: project._id,
        name: project.name,
        about: project.about,
        studentbatch: project.studentbatch,
        guide: {
          name: project.guide.name,
          email: project.guide.email,
        },
        evaluators: project.evaluators.map((e) => ({
          name: e.evaluator.name,
          email: e.evaluator.email,
        })),
        team: project.students.map((s) => ({
          _id: s.student._id,
          name: s.student.name,
          email: s.student.email,
          rollno: s.student.rollno,
          bin: s.student.bin,
        })),
        evaluations: formattedEvaluations,
        latestUpdates: [], // explicitly no updates for evaluator
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error loading the BTP dashboard for evaluator" });
  }
};


export const addTopic = async (req, res) => {
  const user = await Faculty.findOne({
    email: req.user.email,
  });
  if (!user) {
    return res.status(404).json({
      message: "Error finding the faculty",
    });
  }
  if (!req.body.topic || !req.body.about) {
    return res.status(400).json({
      message: "No topic found",
    });
  }
  const { topic, about } = req.body;
  const dept = user.dept;
  if (!["CSE", "ECE", "MDS"].includes(dept)) {
    return res.status(400).json({
      message: "Invalid Department",
    });
  }
  try {
    const existing = await BTPTopic.findOne({ faculty: user._id });
    if (existing) {
      existing.topics.push({
        topic: topic,
        about: about,
        dept: dept,
      });
      await existing.save();
    } else {
      const newtopic = new BTPTopic({
        faculty: user._id,
        topics: [
          {
            topic: topic,
            about: about,
            dept: dept,
          },
        ],
      });
      await newtopic.save();
    }
    return res.status(201).json({
      message: "Topics uploaded successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error releasing the topics",
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { topicid, actualtid } = req.body;
    if (!topicid || !actualtid) {
      return res.status(400).json({
        message: "Id not mentioned",
      });
    }
    const result = await BTPTopic.updateOne(
      { _id: actualtid },
      {
        $pull: {
          topics: { _id: topicid },
          requests: { topic: topicid },
        },
      }
    );
    if (result.matchedCount === 0) {
      return res.status(200).json({
        message: "No Topic found",
      });
    }
    return res.status(200).json({
      message: "Deleted topic and related requests successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error deleting the topic",
    });
  }
};

//delete other requests the team sent
// gotta set the limit on how many requests prof can accept
export const approveTopicRequest = async (req, res) => {
  try {
    const { teamid, topicid } = req.body;
    if (!teamid || !topicid) {
      return res.status(400).json({ message: "Team ID and Topic ID are required" });
    }
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1) find faculty record for current user
    const fac = await Faculty.findOne({ email: req.user.email });
    if (!fac) return res.status(400).json({ message: "No faculty found" });

    // 2) find the BTPTopic document that contains the topic subdoc (topicid)
    const factopicdoc = await BTPTopic.findOne({
      faculty: fac._id,
      "topics._id": topicid,
    });
    if (!factopicdoc) {
      return res.status(400).json({ message: "No topics found under this faculty / invalid topic id" });
    }

    // get the topic subdocument for metadata
    const topicSub = factopicdoc.topics.id(topicid);
    if (!topicSub) return res.status(400).json({ message: "No topic found with that topic id" });

    // 3) find the request inside this faculty doc that matches team & topic
    const request = factopicdoc.requests.find(
      (r) => r.teamid.toString() === teamid && r.topic.toString() === topicid
    );
    if (!request) return res.status(400).json({ message: "No request found with that team id for this topic" });
    if (request.isapproved) return res.status(400).json({ message: "Already approved the request" });

    // 4) Atomically lock the team (only if team is formed and not already assigned)
    const updatedTeam = await BTPTeam.findOneAndUpdate(
      { _id: teamid, isteamformed: true, facultyAssigned: false },
      {
        $set: {
          facultyAssigned: true,
          assigned: {
            faculty: fac._id,
            topicDoc: factopicdoc._id,
            topicId: topicid,
          },
        },
      },
      { new: true }
    );

    if (!updatedTeam) {
      // figure out reason for failure for clearer message
      const existingTeam = await BTPTeam.findById(teamid);
      if (!existingTeam) return res.status(404).json({ message: "Team not found" });
      if (!existingTeam.isteamformed) return res.status(400).json({ message: "Team is not fully formed yet" });
      return res.status(400).json({ message: "Team already assigned" });
    }

    // 5) mark this request as approved (persist in faculty doc)
    request.isapproved = true;
    await factopicdoc.save();

    //automatic team code generator

    // 6) create BTP project (skip missing bins)
    const studentIds = [updatedTeam.bin1?.student, updatedTeam.bin2?.student, updatedTeam.bin3?.student].filter(Boolean);
    const formattedStudents = studentIds.map((id) => ({ student: id }));

    const newbtpproj = new BTP({
      name: topicSub.topic,
      about: topicSub.about,
      studentbatch: updatedTeam.batch,
      students: formattedStudents,
      guide: fac._id,
    });

    await newbtpproj.save();

    return res.status(201).json({ message: "Successfully approved and assigned team to this faculty/topic" });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || "Error approving the request" });
  }
};

//can there be multiple teams for a single topic??
export const rejectTopicRequest = async (req, res) => {
  try {
    if (!req.body.teamid || !req.body.topicid || !req.body.docid) {
      return res.status(400).json({
        message: "Invalid Request",
      });
    }
    const { teamid, topicid, docid } = req.body;
    const topicdoc = await BTPTopic.findOne({
      _id: docid,
    }).populate("faculty");
    if (req.user.email !== topicdoc.faculty.email) {
      return res.status(403).json({
        message: "Not allowed to do this",
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
            topic: topicid,
          },
        },
      }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Request not found or already rejected",
      });
    }
    return res.status(200).json({
      message: "Request rejected successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error rejecting the request",
    });
  }
};

//IMP: for now we r letting the faculty do an evaluation whenever they now
//itll be changed later...
export const evaluateProjectasGuide = async (req, res) => {
  try {
    console.log(req.body)
    const { projid, remark, marks } = req.body;

    if (!projid || !remark || !Array.isArray(marks)) {
      return res.status(400).json({ message: "Invalid request format" });
    }

    const project = await BTP.findById(projid)
      .populate("guide")
      .populate("students.student")
      .populate("evaluators.evaluator");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.guide.email !== req.user.email) {
      return res
        .status(403)
        .json({ message: "Access denied: You are not the guide" });
    }

    const expectedStudentIds = project.students.map((s) =>
      s.student._id.toString()
    );
    const sentStudentIds = marks.map((m) => m.studentId.toString());

    if (sentStudentIds.length !== expectedStudentIds.length) {
      return res
        .status(400)
        .json({ message: "Mismatch in number of students" });
    }

    const uniqueSentIds = new Set(sentStudentIds);
    if (uniqueSentIds.size !== expectedStudentIds.length) {
      return res
        .status(400)
        .json({ message: "Duplicate student entries in marks" });
    }

    const missingIds = expectedStudentIds.filter(
      (id) => !uniqueSentIds.has(id)
    );
    if (missingIds.length > 0) {
      return res
        .status(400)
        .json({ message: "Some student IDs do not match the team" });
    }

    const marksgiven = marks.map((m) => ({
      student: m.studentId,
      guidemarks: m.guidemarks,
      totalgrade: null,
    }));

    const panelEvaluations = project.evaluators.map((ev) => ({
      evaluator: ev.evaluator._id,
      submitted: false,
      submittedAt: null,
      panelmarks: [],
      remark: "",
    }));

    const newEval = new BTPEvaluation({
      projectRef: project._id,
      time: new Date(),
      canstudentsee: false,
      remark,
      marksgiven,
      panelEvaluations,
    });

    await newEval.save();

    return res.status(201).json({
      message: "Guide evaluation successfully submitted",
    });
  } catch (err) {
    console.error("Guide Evaluation Error:", err);
    return res.status(500).json({
      message: "Internal error while evaluating project",
    });
  }
};

export const evaluateProjectasEval = async (req, res) => {
  try {
    console.log(req.body);
    const { projid, panelmarks, remark } = req.body;

    if (!projid || !Array.isArray(panelmarks) || !remark) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    // Get the evaluation for the project
    const evaluation = await BTPEvaluation.findOne({ projectRef: projid })
      .populate("projectRef")
      .populate("panelEvaluations.evaluator");

    if (!evaluation) {
      return res
        .status(404)
        .json({ message: "Evaluation not found for this project" });
    }

    // Find the evaluator entry
    const evaluatorEmail = req.user.email;
    const evaluatorIndex = evaluation.panelEvaluations.findIndex(
      (ev) => ev.evaluator.email === evaluatorEmail
    );

    if (evaluatorIndex === -1) {
      return res
        .status(403)
        .json({ message: "You are not an evaluator for this project" });
    }

    if (evaluation.panelEvaluations[evaluatorIndex].submitted) {
      return res.status(400).json({
        message: "You have already submitted evaluation for this project",
      });
    }

    // Validate student IDs
    const validStudentIds = evaluation.marksgiven.map((m) =>
      m.student.toString()
    );
    const sentStudentIds = panelmarks.map((p) => p.studentId.toString());

    if (validStudentIds.length !== sentStudentIds.length) {
      return res
        .status(400)
        .json({ message: "Mismatch in number of students" });
    }

    const invalidIds = sentStudentIds.filter(
      (id) => !validStudentIds.includes(id)
    );
    if (invalidIds.length > 0) {
      return res
        .status(400)
        .json({ message: "One or more student IDs are invalid" });
    }

    // Save the panel marks
    const formattedPanelMarks = panelmarks.map((pm) => ({
      student: pm.studentId,
      marks: pm.marks,
    }));

    evaluation.panelEvaluations[evaluatorIndex].panelmarks =
      formattedPanelMarks;
    evaluation.panelEvaluations[evaluatorIndex].remark = remark;
    evaluation.panelEvaluations[evaluatorIndex].submitted = true;
    evaluation.panelEvaluations[evaluatorIndex].submittedAt = new Date();

    await evaluation.save();

    return res
      .status(200)
      .json({ message: "Evaluation submitted successfully" });
  } catch (err) {
    console.error("Evaluator evaluation error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
