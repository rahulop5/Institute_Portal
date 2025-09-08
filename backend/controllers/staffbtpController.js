import BTPSystemState from "../models/BTPSystemState.js";
import fs from "fs";
import csvParser from "csv-parser";
import UGStudentBTP from "../models/UGStudentBTP.js";
import BTPTeam from "../models/BTPTeam.js";
import BTPTopic from "../models/BTPTopic.js";
import BTP from "../models/BTP.js";
import Faculty from "../models/Faculty.js";
import Staff from "../models/Staff.js";

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

          console.log(teams[0]);

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
                roll: student.rollno 
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

          return res.status(200).json({
            email: user.email,
            phase: "FA",
            topics: topics,
            assignedTeams: assignedTeams,
            unassignedTeams: unassignedTeams,
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
        console.log("In progress");
        break;

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

export const updateTeam = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Error updating team",
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

// Advance from round k -> k+1 for all teams (or single team if teamId provided)
export const advancePreferenceRound = async (req, res) => {
  try {
    const query = {
      facultyAssigned: false,
      currentPreference: { $gte: 1, $lte: 4 },
    };
    const teams = await BTPTeam.find(query);
    if (teams.length === 0) {
      return res.status(200).json({ message: "No teams to advance" });
    }

    for (const team of teams) {
      const k = team.currentPreference;
      if (k < 1 || k > 4) continue;

      // 1) Delete unapproved requests for round k across ALL BTPTopic docs
      await BTPTopic.updateMany(
        { "requests.teamid": team._id, "requests.preference": k },
        {
          $pull: {
            requests: { teamid: team._id, preference: k, isapproved: false },
          },
        }
      );

      // 2) If already assigned in the meantime, skip pushing next
      const freshTeam = await BTPTeam.findById(team._id);
      if (freshTeam.facultyAssigned) continue;

      // 3) Move to next round if exists
      if (k < 4) {
        const next = k + 1;
        const pNext = freshTeam.preferences.find((p) => p.order === next);
        if (pNext) {
          const doc = await BTPTopic.findById(pNext.topicDoc);
          if (doc) {
            const already = doc.requests.some(
              (r) =>
                r.teamid.toString() === freshTeam._id.toString() &&
                r.topic.toString() === pNext.topicId.toString() &&
                r.preference === next
            );
            if (!already) {
              doc.requests.push({
                teamid: freshTeam._id,
                topic: pNext.topicId,
                isapproved: false,
                preference: next,
              });
              await doc.save();
            }
          }
          freshTeam.currentPreference = next;
          await freshTeam.save();
        }
      } else {
        // Round 4 ended and not assigned — do nothing more here (could mark exhausted if you want)
      }
    }
    return res
      .status(200)
      .json({ message: "Advanced preference round successfully" });
  } catch (err) {
    console.log(err);
    return res.status(err.status || 500).json({
      message: err.message || "Error advancing preference round",
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
