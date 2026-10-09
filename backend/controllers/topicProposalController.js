import Faculty from "../models/Faculty.js";
import Student from "../models/feedback/Student.js";
import { studentSemesterOn, startWindowProblem } from "../utils/semesterUtils.js";

const DEPARTMENTS = ["CSE", "ECE", "MDS"];
const TITLE_MAX = 150;
const ABOUT_MAX = 1000;

// A student's own BTP/Honors topic, proposed to a faculty member of their
// choice. It is stored as a topic under that faculty member marked
// `proposedBy` (so only the proposer and that faculty member see it), plus an
// ordinary request for it - from there the existing approve / reject /
// withdraw paths handle it like any listed topic.
export const proposeTopic = ({ program, label, Topic, Registration, OtherRegistration, otherLabel }) =>
  async (req, res) => {
    try {
      const facultyId = req.body.facultyId;
      const topic = (req.body.topic || "").trim();
      const about = (req.body.about || "").trim();
      if (!facultyId || !topic || !about) {
        return res.status(400).json({ message: "Choose a faculty member and describe your topic." });
      }
      if (topic.length > TITLE_MAX || about.length > ABOUT_MAX) {
        return res.status(400).json({ message: `Keep the title under ${TITLE_MAX} and the description under ${ABOUT_MAX} characters.` });
      }

      const student = await Student.findOne({ email: req.user.email });
      if (!student) return res.status(404).json({ message: "Student not found" });

      const startProblem = startWindowProblem(program, studentSemesterOn(student.batch, new Date()));
      if (startProblem) return res.status(400).json({ message: startProblem });

      const other = await OtherRegistration.findOne({ student: student._id, project: { $ne: null } });
      if (other) {
        return res.status(400).json({ message: `You are already enrolled in ${otherLabel} project. You cannot participate in ${label}.` });
      }

      const faculty = await Faculty.findById(facultyId);
      if (!faculty) return res.status(404).json({ message: "Faculty not found" });

      const registration = (await Registration.findOne({ student: student._id })) || new Registration({ student: student._id });
      if (registration.project) return res.status(400).json({ message: "You are already in a project" });

      const topicDoc = (await Topic.findOne({ faculty: faculty._id })) || new Topic({ faculty: faculty._id, topics: [], requests: [] });

      // One open proposal per faculty member.
      const waiting = topicDoc.topics.some(
        (t) =>
          t.proposedBy?.equals(registration._id) &&
          topicDoc.requests.some((r) => r.student.equals(registration._id) && r.topic.equals(t._id))
      );
      if (waiting) {
        return res.status(400).json({ message: "You already have a proposal waiting with this faculty member." });
      }

      const dept = DEPARTMENTS.includes(faculty.dept) ? faculty.dept : DEPARTMENTS.includes(student.department) ? student.department : "CSE";
      topicDoc.topics.push({ topic, about, dept, proposedBy: registration._id });
      const proposed = topicDoc.topics[topicDoc.topics.length - 1];

      const preference = registration.requests.length + 1;
      topicDoc.requests.push({ student: registration._id, topic: proposed._id, isapproved: false, preference });
      registration.requests.push({ topic: topicDoc._id, subTopicId: proposed._id, status: "Pending", preference });

      await registration.save();
      await topicDoc.save();

      return res.status(200).json({ message: "Proposal sent" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error sending proposal" });
    }
  };

// Topics a student may see: everything listed by faculty, plus their own
// proposals (other students' proposals stay private).
export const visibleTopics = (topicDoc, registration) =>
  topicDoc.topics.filter((t) => !t.proposedBy || (registration && t.proposedBy.equals(registration._id)));

// Once a student has a project, drop their other pending requests and
// proposals everywhere so no faculty member is left with a stale request.
export const clearOpenRequests = (Topic, registrationId) =>
  Topic.updateMany({}, { $pull: { requests: { student: registrationId }, topics: { proposedBy: registrationId } } });

// Everyone a student can propose to.
export const facultyDirectory = async () =>
  (await Faculty.find({}, "name email dept").sort({ name: 1 })).map((f) => ({ _id: f._id, name: f.name, email: f.email, dept: f.dept }));
