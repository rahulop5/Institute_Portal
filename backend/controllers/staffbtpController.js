import BTPSystemState from "../models/BTPSystemState.js";
import fs from "fs";
import csvParser from "csv-parser";
import UGStudentBTP from "../models/UGStudentBTP.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import Faculty from "../models/Faculty.js";
import Staff from "../models/Staff.js";
import BTPEvaluation from "../models/BTPEvaluation.js";

//have to send the additional details to frontend
export const getStaffBTPDashboard = async (req, res) => {
  try {
    if (!req.query.batch) {
      return res.status(400).json({
        message: "No batch specified",
      });
    }
    const user = await Staff.findOne({
      email: req.user.email,
    });
    const batch = req.query.batch;
    const currstate = await BTPSystemState.findOne({
      studentbatch: batch,
    });
    if (!currstate) {
      return res.status(404).json({
        message: "No batch found",
      });
    }
    switch (currstate.currentPhase) {
      case "NOT_STARTED":
        return res.status(200).json({
          message: "Upload CSV Sheet of bins",
          email: user.email,
          phase: "NS",
        });

      case "TEAM_FORMATION":
        try {
          const teams = await BTPTeam.find()
            .populate("bin1.student", "name email bin rollno")
            .populate("bin2.student", "name email bin rollno")
            .populate("bin3.student", "name email bin rollno");

          // console.log(teams[0]);

          const studentIdsInTeams = new Set();
          teams.forEach((team) => {
            if (team.bin1?.student)
              studentIdsInTeams.add(team.bin1.student._id.toString());
            if (team.bin2?.student)
              studentIdsInTeams.add(team.bin2.student._id.toString());
            if (team.bin3?.student)
              studentIdsInTeams.add(team.bin3.student._id.toString());
          });

          const unteamedStudents = await UGStudentBTP.find({
            _id: { $nin: Array.from(studentIdsInTeams) },
          }).select("name email bin rollno");

          // Format team into frontend shape
          const formatTeam = (team, index) => {
            const members = [];

            if (team.bin1?.student) {
              members.push({
                student: {
                  name: team.bin1.student.name,
                  roll: team.bin1.student.rollno,
                  email: team.bin1.student.email,
                },
                bin: team.bin1.student.bin,
                isApproved: team.bin1.approved, // comes from bin schema
              });
            }
            if (team.bin2?.student) {
              members.push({
                student: {
                  name: team.bin2.student.name,
                  roll: team.bin2.student.rollno,
                  email: team.bin2.student.email,
                },
                bin: team.bin2.student.bin,
                isApproved: team.bin2.approved,
              });
            }
            if (team.bin3?.student) {
              members.push({
                student: {
                  name: team.bin3.student.name,
                  roll: team.bin3.student.rollno,
                  email: team.bin3.student.email,
                },
                bin: team.bin3.student.bin,
                isApproved: team.bin3.approved,
              });
            }

            return {
              teamid: team.id,
              teamName: `Team ${index + 1}`,
              isTeamFormed: team.isteamformed,
              members,
            };
          };

          const response = {
            fullyFormedTeams: teams
              .filter((t) => t.isteamformed === true)
              .map(formatTeam),
            partiallyFormedTeams: teams
              .filter((t) => t.isteamformed === false)
              .map(formatTeam),
            unallocatedMembers: unteamedStudents.map((student) => ({
              student: {
                name: student.name,
                email: student.email,
                roll: student.rollno,
              },
              bin: student.bin,
            })),
          };

          return res.status(200).json({
            email: user.email,
            phase: "TF",
            response: response,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            email: user.email,
            phase: "TF",
            message: "Error loading BTP teams",
          });
        }

      case "FACULTY_ASSIGNMENT":
        try {
          //can possibly uk attach the approved requests to topics but we can do it in frontend too
          const topics = await BTPTopic.find()
            .populate("faculty")
            .populate("requests.teamid");

          const approvedTeamIds = [];

          //deleting teh pending requests and addin assgined teams
          topics.forEach((topic) => {
            topic.requests = topic.requests.filter((request) => {
              return request.isapproved;
            });
            topic.requests.forEach((request) => {
              approvedTeamIds.push(request.teamid._id.toString());
            });
          });

          const teams = await BTPTeam.find()
            .populate("bin1.student", "name email bin")
            .populate("bin2.student", "name email bin")
            .populate("bin3.student", "name email bin");

          //separating the teams
          const assignedTeams = [];
          const unassignedTeams = [];

          teams.forEach((team) => {
            if (approvedTeamIds.includes(team._id.toString())) {
              assignedTeams.push(team);
            } else {
              unassignedTeams.push(team);
            }
          });

          const systemState = await BTPSystemState.findOne({
            studentbatch: batch,
          });
          if (!systemState) {
            return res.status(404).json({ message: "System state not found" });
          }

          const k = systemState.currentPreferenceRound;

          return res.status(200).json({
            email: user.email,
            phase: "FA",
            topics: topics,
            assignedTeams: assignedTeams,
            unassignedTeams: unassignedTeams,
            currentPreferenceRound: k,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            phase: "FA",
            email: user.email,
            message: "Error loading dashboard",
          });
        }

      case "IN_PROGRESS":
        try {
          // Fetch all projects
          const projects = await BTP.find()
            .populate("students.student", "name email")
            .populate("guide", "name email");

          if (!projects || projects.length === 0) {
            return res.status(200).json({
              phase: "IP",
              email: req.user.email, // staff email from auth
              projects: [],
            });
          }

          // Format response for frontend
          const formattedProjects = projects.map((p) => ({
            _id: p._id,
            topic: p.name,
            projid: p._id, // or custom project ID if you have one
            team: p.students.map((s) => s.student?.name),
          }));

          return res.status(200).json({
            phase: "IP",
            email: req.user.email,
            projects: formattedProjects,
          });
        } catch (err) {
          console.error("Error fetching staff projects:", err);
          return res.status(500).json({
            message: "Error loading staff projects dashboard",
          });
        }

      case "COMPLETED":
        break;

      default:
        return res.status(500).json({
          message: "Invalid Phase",
        });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error loading the dashboard",
    });
  }
};

export const viewProjectStaff = async (req, res) => {
  try {
    if (!req.query.projid) {
      return res.status(400).json({ message: "Invalid Request" });
    }

    const project = await BTP.findOne({ _id: req.query.projid })
      .populate("students.student")
      .populate("guide")
      .populate("evaluators.evaluator");

    if (!project) {
      return res.status(404).json({ message: "Cant Find Project" });
    }

    const evaluations = await BTPEvaluation.find({
      projectRef: project._id,
    }).sort({ time: 1 });

    const updates = project.updates.sort(
      (a, b) => new Date(a.time) - new Date(b.time)
    );

    const formattedEvaluations = [];
    let remainingUpdates = [...updates];

    for (let i = 0; i < evaluations.length; i++) {
      const currEval = evaluations[i];
      const nextEvalTime = evaluations[i + 1]?.time || null;

      const evalUpdates = remainingUpdates.filter((u) => {
        return u.time < (nextEvalTime || new Date(8640000000000000));
      });

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
        marksgiven: currEval.marksgiven,
        panelEvaluations: currEval.panelEvaluations,
      });
    }

    return res.status(200).json({
      phase: "IP",
      message: "Student Progress Dashboard",
      // these you might later compute dynamically
      nextEvalDate: {
        month: "March",
        day: 15,
      },
      currentScore: {
        value: 48,
        outOf: 50,
      },
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
        updates: project.updates,
        latestUpdates: project.updates.slice(-3).map((u, idx) => ({
          title: `Update ${idx + 1}`,
          description: u.update,
          timestamp: u.time,
        })),
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error loading the BTP dashboard in Progress phase" });
  }
};

export const verifyPhase = ({ phase }) => {
  return async (req, res, next) => {
    try {
      if (!req.query.batch) {
        return res.status(400).json({
          message: "Incomplete request. No batch mentioned",
        });
      }
      const currphase = await BTPSystemState.findOne({
        studentbatch: req.query.batch,
      });
      if (currphase.currentPhase !== phase) {
        return res.status(400).json({
          message: "Cant access this page now",
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({
        message: "Error verifying the phase",
      });
    }
  };
};

//basically this function ends the not_started phase
export const uploadCSVSheet = async (req, res) => {
  if (!req.query.batch) {
    return res.status(400).json({
      message: "No batch specified",
    });
  }
  const batch = req.query.batch;
  const currstate = await BTPSystemState.findOne({
    studentbatch: batch,
  });
  if (!currstate) {
    return res.status(404).json({
      message: "No batch found",
    });
  }
  if (currstate.currentPhase !== "NOT_STARTED") {
    return res.status(400).json({
      message: "Cant upload bins at this phase",
    });
  }
  try {
    const filePath = "./uploads/bins.csv";
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", async (row) => {
        const { email, bin } = row;
        if (!email || !bin) {
          return res.status(400).json({
            message: "No email or bin found",
          });
        }
        const result = await UGStudentBTP.findOneAndUpdate(
          { email: email.trim() },
          { bin: Number(bin) },
          { new: true }
        );
        if (!result) {
          return res.status(404).json({
            message: `Not able to update bin for ${email}, Exiting...`,
          });
        }
      })
      .on("end", async () => {
        currstate.currentPhase = "TEAM_FORMATION";
        currstate.updatedAt = Date.now();
        await currstate.save();
        res.status(200).json({
          message: "Updated Bins successfully. Team Formation phase started",
        });
      })
      .on("error", (err) => {
        console.log(err);
        return res.status(500).json({
          message: "Error parsing csv file",
        });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error updating bins of students",
    });
  }
};

//the studs who are in partial teams also come as unteamed
//handle the case where no bin1 or other bins are left like abnormal teams
export const createTeambyStaff = async (req, res) => {
  try {
    //handle batch of the students like make sure they are all from the intended batch
    if (!req.body.bin1 || !req.body.bin2 || !req.body.bin3) {
      return res.status(500).json({
        message: "Incomplete request.",
      });
    }
    const { bin1, bin2, bin3 } = req.body;
    if (bin1 === bin2 || bin2 === bin3 || bin1 === bin3) {
      return res.status(400).json({
        message: "Emails need to be different",
      });
    }
    //im not verifying the bins of the students becoz uk obv reasons
    const verifyTeam = async (email) => {
      const student = await UGStudentBTP.findOne({
        email: email,
      });
      if (!student) {
        throw new Error(`Student not found with email ${email}`);
      }
      if (student.batch !== req.query.batch) {
        throw new Error(`Student ${email} is not from batch ${batch}`);
      }
      const binstr = `bin${student.bin}.student`;
      const teams = await BTPTeam.find({
        [binstr]: student._id,
      });
      if (teams.length === 0) {
        return student;
      }
      for (const team of teams) {
        if (team.isteamformed) {
          return false;
        }
      }
      return student;
    };
    const s1 = await verifyTeam(bin1);
    const s2 = await verifyTeam(bin2);
    const s3 = await verifyTeam(bin3);
    if (!s1 || !s2 || !s3) {
      return res.status(400).json({
        message: "All the students need to not be in any team",
      });
    }
    //create a new team
    const newteam = new BTPTeam({
      batch: req.query.batch,
      bin1: {
        student: s1._id,
        approved: true,
      },
      bin2: {
        student: s2._id,
        approved: true,
      },
      bin3: {
        student: s3._id,
        approved: true,
      },
      isteamformed: true,
    });
    await newteam.save();
    return res.status(200).json({
      message: "New team created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error creating team",
    });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    if (!req.body.teamid) {
      return res.status(400).json({
        message: "No Team selected",
      });
    }
    const deletee = await BTPTeam.deleteOne({
      _id: req.body.teamid,
      batch: req.query.batch,
    });
    if (deletee.deletedCount !== 1) {
      return res.status(400).json({
        message: "Team not found",
      });
    }
    return res.status(201).json({
      message: "Successfully deleted the team",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error deleting team",
    });
  }
};

//restricting bins here
export const updateTeam = async (req, res) => {
  try {
    if (
      !req.body.teamid ||
      !req.body.bin1 ||
      !req.body.bin2 ||
      !req.body.bin3
    ) {
      return res.status(400).json({
        message: "Incomplete request. teamid, bin1, bin2, bin3 are required.",
      });
    }

    const { teamid, bin1, bin2, bin3 } = req.body;

    // each bin must have both fields
    const bins = { bin1, bin2, bin3 };
    for (const [binName, binValue] of Object.entries(bins)) {
      if (!binValue.email || binValue.isApproved === undefined) {
        return res.status(400).json({
          message: `${binName} requires { email, isApproved }`,
        });
      }
    }

    //  2. Find team
    const team = await BTPTeam.findById(teamid)
      .populate("bin1.student")
      .populate("bin2.student")
      .populate("bin3.student");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    //  3. Verify & process each bin
    const processBin = async (incoming, current, binName) => {
      const incomingEmail = incoming.email;
      const currentEmail = current?.student?.email;

      // same student → no change
      if (incomingEmail === currentEmail) {
        return current;
      }

      // find new student
      const newStudent = await UGStudentBTP.findOne({ email: incomingEmail });
      if (!newStudent) {
        throw new Error(`Student not found with email ${incomingEmail}`);
      }

      // check student batch consistency
      if (newStudent.batch !== team.batch) {
        throw new Error(
          `Student ${incomingEmail} is not from batch ${team.batch}`
        );
      }

      // check if already in another formed team
      const binStrs = ["bin1.student", "bin2.student", "bin3.student"];
      const existingTeam = await BTPTeam.findOne({
        _id: { $ne: teamid },
        $or: binStrs.map((b) => ({ [b]: newStudent._id })),
      });
      if (existingTeam) {
        throw new Error(`Student ${incomingEmail} already in another team`);
      }

      // replace: always reset approval to false
      return {
        student: newStudent._id,
        approved: false,
      };
    };

    team.bin1 = await processBin(bin1, team.bin1, "bin1");
    team.bin2 = await processBin(bin2, team.bin2, "bin2");
    team.bin3 = await processBin(bin3, team.bin3, "bin3");

    // ✅ 4. Update team formed status
    team.isteamformed = !!(
      team.bin1.approved &&
      team.bin2.approved &&
      team.bin3.approved
    );

    // ✅ 5. Save
    await team.save();

    return res.status(200).json({
      message: "Team updated successfully",
      team,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message || "Error updating team",
    });
  }
};

//literally in the name of the function
//currently considering the ideal case
export const endTeamFormationPhase = async (req, res) => {
  try {
    if (!req.query.batch) {
      return res.status(400).json({
        message: "Incomplete request. No batch mentioned",
      });
    }
    const currphase = await BTPSystemState.findOne({
      studentbatch: req.query.batch,
    });
    if (currphase.currentPhase !== "TEAM_FORMATION") {
      return res.status(400).json({
        message: "Cant access this page now",
      });
    }
    currphase.currentPhase = "FACULTY_ASSIGNMENT";
    await currphase.save();
    return res.status(201).json({
      message: `Successfully moved batch ${req.query.batch} to Faculty Assignment phase`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error verifying the phase",
    });
  }
};

//old shit
export const allocateFacultytoTeam = async (req, res) => {
  try {
    if (!req.body.docid || !req.body.topicid || !req.body.teamid) {
      return res.status(400).json({
        message: "Invalid details sent",
      });
    }
    const { docid, topicid, teamid } = req.body;
    const teamcheck = await BTPTopic.findOne({
      "requests.teamid": teamid,
      "requests.isapproved": true,
    });
    if (teamcheck) {
      return res.status(400).json({
        message: "This team is already assigned to a faculty",
      });
    }
    const topicdoc = await BTPTopic.findById(docid);
    if (!topicdoc) {
      return res
        .status(404)
        .json({ message: "Faculty topic document not found" });
    }
    const topic = topicdoc.topics.id(topicid);
    if (!topic) {
      return res
        .status(404)
        .json({ message: "Topic not found under this faculty" });
    }
    topicdoc.requests.push({
      teamid: teamid,
      topic: topicid,
      isapproved: true,
    });
    await topicdoc.save();
    //saving in actual BTP Project
    const team = await BTPTeam.findById(teamid);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const studentIds = [
      team.bin1?.student,
      team.bin2?.student,
      team.bin3?.student,
    ].filter(Boolean);
    const formattedStudents = studentIds.map((id) => ({ student: id }));

    const newbtpproj = new BTP({
      name: topic.topic,
      about: topic.about,
      studentbatch: team.batch,
      students: formattedStudents,
      guide: topicdoc.faculty,
    });

    await newbtpproj.save();

    return res.status(200).json({
      message: "Faculty successfully allocated to team",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error allocating faculty",
    });
  }
};

export const deallocateFacultyforTeam = async (req, res) => {
  try {
    const { teamid } = req.body;
    if (!teamid) {
      return res.status(400).json({
        message: "Team ID is required",
      });
    }
    const topicDoc = await BTPTopic.findOne({
      "requests.teamid": teamid,
      "requests.isapproved": true,
    });
    if (!topicDoc) {
      return res.status(404).json({
        message: "This team is not assigned to any faculty",
      });
    }
    const approvedRequest = topicDoc.requests.find(
      (req) => req.teamid.toString() === teamid && req.isapproved
    );

    if (!approvedRequest) {
      return res.status(404).json({
        message: "Approved request not found",
      });
    }
    const approvedTopicId = approvedRequest.topic;
    topicDoc.requests = topicDoc.requests.filter(
      (req) => req.teamid.toString() !== teamid
    );
    await topicDoc.save();

    const team = await BTPTeam.findById(teamid);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    const studentIds = [
      team.bin1.student,
      team.bin2?.student,
      team.bin3?.student,
    ].filter(Boolean);

    await BTP.deleteOne({
      guide: topicDoc.faculty,
      students: {
        $all: studentIds.map((id) => ({ student: id })),
      },
    });

    return res.status(200).json({
      message: "Successfully deallocated faculty from team",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error deallocating faculty from team",
    });
  }
};

export const approveFacultyToTeam = async (req, res) => {
  try {
    const { facultyId, teamId, topicDocId, topicId } = req.body;

    if (!facultyId || !teamId || !topicDocId || !topicId) {
      return res.status(400).json({
        message: "facultyId, teamId, topicDocId, and topicId are required",
      });
    }

    // Find the faculty's BTPTopic document
    const btpTopicDoc = await BTPTopic.findOne({
      _id: topicDocId,
      faculty: facultyId,
    });
    if (!btpTopicDoc) {
      return res.status(404).json({ message: "Faculty topicDoc not found" });
    }

    // Check if faculty already approved this request
    const request = btpTopicDoc.requests.find(
      (r) => r.teamid.toString() === teamId && r.topic.toString() === topicId
    );
    if (!request || !request.isapproved) {
      return res
        .status(400)
        .json({ message: "Faculty has not approved this request yet" });
    }

    // Get the topic details for BTP creation
    const topicObj = btpTopicDoc.topics.find(
      (t) => t._id.toString() === topicId
    );
    if (!topicObj) {
      return res
        .status(404)
        .json({ message: "Topic not found in faculty's list" });
    }

    // Get the team
    const teamDoc = await BTPTeam.findById(teamId)
      .populate("bin1.student")
      .populate("bin2.student")
      .populate("bin3.student");
    if (!teamDoc) {
      return res.status(404).json({ message: "Team not found" });
    }

    // 🔒 Check if a BTP already exists for this faculty-topic-team combo
    const existingBTP = await BTP.findOne({
      guide: facultyId,
      name: topicObj.topic,
      studentbatch: teamDoc.batch,
      "students.student": {
        $in: [
          teamDoc.bin1?.student?._id,
          teamDoc.bin2?.student?._id,
          teamDoc.bin3?.student?._id,
        ].filter(Boolean),
      },
    });

    if (existingBTP) {
      return res.status(400).json({
        message:
          "This BTP already exists for the given faculty, team, and topic",
        btp: existingBTP,
      });
    }

    // Build students array from bins
    const studentsArray = [];
    if (teamDoc.bin1) studentsArray.push({ student: teamDoc.bin1.student._id });
    if (teamDoc.bin2) studentsArray.push({ student: teamDoc.bin2.student._id });
    if (teamDoc.bin3) studentsArray.push({ student: teamDoc.bin3.student._id });

    // Create new BTP document
    const newBTP = new BTP({
      name: topicObj.topic,
      about: topicObj.about,
      studentbatch: teamDoc.batch,
      students: studentsArray,
      guide: facultyId,
      evaluators: [],
      updates: [],
    });
    await newBTP.save();

    // Update team to lock it
    teamDoc.facultyAssigned = true;
    teamDoc.assigned = {
      faculty: facultyId,
      topicDoc: topicDocId,
      topicId: topicId,
    };
    await teamDoc.save();

    return res.status(200).json({
      message: "Staff approved the team. BTP created successfully.",
      btp: newBTP,
      team: teamDoc,
    });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error approving staff to team",
    });
  }
};

export const assignGuideToTeam = async (req, res) => {
  try {
    const { teamid, facultyId, topicid } = req.body;

    if (!teamid || !facultyId || !topicid) {
      return res.status(400).json({
        message: "Team ID, Faculty ID, and Topic ID are required",
      });
    }

    // 1) find team
    const team = await BTPTeam.findById(teamid);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (!team.isteamformed) {
      return res.status(400).json({ message: "Team is not fully formed yet" });
    }
    if (team.facultyAssigned) {
      return res.status(400).json({ message: "Team already assigned" });
    }

    // 2) verify faculty
    const fac = await Faculty.findById(facultyId);
    if (!fac) return res.status(404).json({ message: "Faculty not found" });

    // 3) find the topicDoc and topic inside that faculty
    const factopicdoc = await BTPTopic.findOne({
      faculty: facultyId,
      "topics._id": topicid,
    });
    if (!factopicdoc) {
      return res
        .status(400)
        .json({
          message: "No topics found under this faculty / invalid topic id",
        });
    }

    const topicSub = factopicdoc.topics.id(topicid);
    if (!topicSub)
      return res
        .status(400)
        .json({ message: "Invalid topic id for this faculty" });

    // 4) assign guide to team
    team.facultyAssigned = true;
    team.assigned = {
      faculty: fac._id,
      topicDoc: factopicdoc._id,
      topicId: topicid,
    };
    await team.save();

    // 5) record this as an "approved" request in faculty doc (optional but consistent)
    const alreadyReq = factopicdoc.requests.some(
      (r) =>
        r.teamid.toString() === teamid &&
        r.topic.toString() === topicid &&
        r.isapproved
    );
    if (!alreadyReq) {
      factopicdoc.requests.push({
        teamid,
        topic: topicid,
        isapproved: true,
        preference: team.currentPreference || 0,
      });
      await factopicdoc.save();
    }

    // 6) create BTP project
    const studentIds = [
      team.bin1?.student,
      team.bin2?.student,
      team.bin3?.student,
    ].filter(Boolean);

    const formattedStudents = studentIds.map((id) => ({ student: id }));

    const newbtpproj = new BTP({
      name: topicSub.topic,
      about: topicSub.about,
      studentbatch: team.batch,
      students: formattedStudents,
      guide: fac._id,
    });

    await newbtpproj.save();

    return res.status(201).json({
      message: "Successfully assigned guide and topic to team",
      team,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Error assigning guide to team" });
  }
};

export const rejectFacultyFromTeam = async (req, res) => {
  try {
    const { topicDocId, teamId, topicId } = req.body;

    if (!topicDocId || !teamId || !topicId) {
      return res
        .status(400)
        .json({ message: "topicDocId, teamId, and topicId are required" });
    }

    // Pull only if isapproved = true
    const updatedTopicDoc = await BTPTopic.findOneAndUpdate(
      {
        _id: topicDocId,
        "requests.teamid": teamId,
        "requests.topic": topicId,
        "requests.isapproved": true,
      },
      {
        $pull: {
          requests: { teamid: teamId, topic: topicId, isapproved: true },
        },
      },
      { new: true }
    );

    if (!updatedTopicDoc) {
      return res.status(404).json({
        message:
          "No approved request found for this team in the given topicDoc",
      });
    }

    return res.status(200).json({
      message: "Faculty request rejected successfully",
      data: updatedTopicDoc,
    });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error rejecting faculty",
    });
  }
};

export const advancePreferenceRound = async (req, res) => {
  try {
    const { batch } = req.query;

    const systemState = await BTPSystemState.findOne({ studentbatch: batch });
    if (!systemState) {
      return res.status(404).json({ message: "System state not found" });
    }

    const k = systemState.currentPreferenceRound;
    if (k < 1 || k > 4) {
      return res.status(200).json({ message: "No active round to advance" });
    }

    // All teams of this batch not yet assigned
    const teams = await BTPTeam.find({ batch, facultyAssigned: false });
    // if (teams.length === 0) {
    //   return res.status(200).json({ message: "No teams to advance" });
    // }

    // Process each team for current round k
    for (const team of teams) {
      // 1) Remove unapproved requests for round k
      await BTPTopic.updateMany(
        { "requests.teamid": team._id, "requests.preference": k },
        {
          $pull: {
            requests: { teamid: team._id, preference: k, isapproved: false },
          },
        }
      );

      // 2) Push request for round k+1 if exists
      if (k < 4) {
        const next = k + 1;
        const pNext = team.preferences.find((p) => p.order === next);
        if (pNext) {
          const doc = await BTPTopic.findById(pNext.topicDoc);
          if (doc) {
            const already = doc.requests.some(
              (r) =>
                r.teamid.toString() === team._id.toString() &&
                r.topic.toString() === pNext.topicId.toString() &&
                r.preference === next
            );
            if (!already) {
              doc.requests.push({
                teamid: team._id,
                topic: pNext.topicId,
                isapproved: false,
                preference: next,
              });
              await doc.save();
            }
          }
        }

        // update team’s own currentPreference
        team.currentPreference = next;
        await team.save();
      }
    }

    // 3) Advance global round
    if (k < 4) {
      systemState.currentPreferenceRound = k + 1;
      await systemState.save();
    } else {
      // Round 4 finished → check if all teams are assigned
      const unassignedTeams = await BTPTeam.countDocuments({
        batch,
        facultyAssigned: false,
      });

      if (unassignedTeams === 0) {
        //  All assigned → move system to next phase
        systemState.currentPhase = "IN_PROGRESS"; // or whatever the next phase is
        await systemState.save();

        // also update all teams
        await BTPTeam.updateMany({ batch }, { $set: { currentPreference: 4 } });

        return res.status(200).json({
          message: "All teams assigned. Moved system to IN_PROGRESS phase.",
        });
      } else {
        return res.status(200).json({
          message:
            "Round 4 ended but some teams remain unassigned. System stays in FACULTY_ASSIGNMENT.",
        });
      }
    }

    return res.status(200).json({
      message: "Advanced centralized preference round successfully",
      newRound: systemState.currentPreferenceRound,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message || "Error advancing centralized preference round",
    });
  }
};

export const endFacultyAssignmentPhase = async (req, res) => {
  try {
    if (!req.query.batch) {
      return res.status(400).json({
        message: "Incomplete request. No batch mentioned",
      });
    }
    const currphase = await BTPSystemState.findOne({
      studentbatch: req.query.batch,
    });
    if (currphase.currentPhase !== "FACULTY_ASSIGNMENT") {
      return res.status(400).json({
        message: "Cant access this page now",
      });
    }
    currphase.currentPhase = "IN_PROGRESS";
    await currphase.save();
    return res.status(201).json({
      message: `Successfully moved batch ${req.query.batch} to In Progress phase`,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error verifying the phase",
    });
  }
};

export const assignEvaluator = async (req, res) => {
  try {
    const { projid, facultyemail1, facultyemail2 } = req.body;
    if (!projid || !facultyemail1 || !facultyemail2) {
      return res.status(400).json({ message: "Incomplete request." });
    }
    if (facultyemail1 === facultyemail2) {
      return res
        .status(400)
        .json({ message: "Cannot assign the same faculty twice." });
    }

    const project = await BTP.findOne({ _id: projid }).populate(
      "guide evaluators.evaluator"
    );

    if (!project) {
      return res.status(404).json({ message: "No project found." });
    }

    if (project.evaluators.length >= 2) {
      return res.status(400).json({ message: "Evaluators already assigned." });
    }

    // Ensure neither email is the guide's
    if (
      project.guide.email === facultyemail1 ||
      project.guide.email === facultyemail2
    ) {
      return res
        .status(400)
        .json({ message: "Guide cannot be assigned as an evaluator." });
    }

    // Fetch faculty documents
    const faculty1 = await Faculty.findOne({ email: facultyemail1 });
    const faculty2 = await Faculty.findOne({ email: facultyemail2 });

    if (!faculty1 || !faculty2) {
      return res
        .status(404)
        .json({ message: "One or both faculty members not found." });
    }

    // Check for duplicate assignment
    const assignedIds = project.evaluators.map((ev) =>
      ev.evaluator._id.toString()
    );
    if (
      assignedIds.includes(faculty1._id.toString()) ||
      assignedIds.includes(faculty2._id.toString())
    ) {
      return res.status(400).json({
        message: "One or both evaluators already assigned to this project.",
      });
    }

    // Final evaluator limit check
    if (project.evaluators.length + 2 > 2) {
      return res
        .status(400)
        .json({ message: "Assigning both would exceed evaluator limit." });
    }
    project.evaluators.push({ evaluator: faculty1._id });
    project.evaluators.push({ evaluator: faculty2._id });

    await project.save();

    return res
      .status(200)
      .json({ message: "Evaluators assigned successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error assigning evaluators." });
  }
};
