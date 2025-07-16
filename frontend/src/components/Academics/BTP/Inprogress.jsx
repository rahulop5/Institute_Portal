// Inprogress.jsx
import ProjectCard from "./ProjectCard";
import EvaluationCard from "./EvaluationCard";
import ProgressCard from "./ProgressCard";
import NextEvalCard from "./NextEvalCard";
import TeamCard from "./TeamCard";
import RemarksCard from "./RemarksCard";
import ScoreCard from "./ScoreCard";
import EvaluationDetails from "./Evaluations";
import AddUpdateCard from "./UpdateCard";


 const data = {
    message: "Student Progress Dashboard",
    project: {
      name: "Deployment Services",
      about:
        "It's a backend service that helps to deploy things using Docker, etc. It also has a frontend that helps to visualize the deployment process.",
      studentbatch: "2022",
      guide: {
        name: "Dr. Asha Iyer",
        email: "asha.iyer@example.com",
      },
      team: [
        {
          name: "Vihaan Isha",
          email: "vihaan.isha1@example.com",
        },
        {
          name: "Vivaan Sneha",
          email: "vivaan.sneha21@example.com",
        },
        {
          name: "Diya Sai",
          email: "diya.sai38@example.com",
        },
      ],
      evaluations: [
        {
          _id: "6870cd1c5828dfb6c81df491",
          time: "2025-07-11T08:36:44.744Z",
          remark: "Good progress Overall",
          resources: [],
          updates: [
            {
              update: "Learnt Docker and also did some coding",
              time: "2025-07-11T07:41:46.152Z",
              _id: "6870c03a46727d80c53381e2",
            },
            {
              update: "Learnt how to containerize Node.js apps",
              time: "2025-07-11T07:46:16.000Z",
              _id: "6870c14845ca91b0d3435d9b",
            },
          ],
          canstudentsee: true,
          marksgiven: 15,
        },
        {
          _id: "6870cd1c5828dfb6c81df999",
          time: "2025-08-20T10:00:00.000Z",
          remark:
            "Excellent collaboration. More technical details expected in final phase.",
          updates: [
            {
              update: "Integrated CI/CD pipeline using GitHub Actions",
              time: "2025-08-19T15:30:00.000Z",
              _id: "6870c99945ca91b0d3435dff",
            },
            {
              update: "Conducted load testing using JMeter",
              time: "2025-08-20T09:15:00.000Z",
              _id: "6870d11145ca91b0d3435eef",
            },
          ],
          canstudentsee: true,
          marksgiven: 17,
        },
      ],
      latestUpdates: [
        {
          update: "Started integrating monitoring tools like Prometheus.",
          time: "2025-07-15T10:20:00.000Z",
          _id: "6871aaaa45ca91b0d3435f11",
        },
        {
          update: "Fixed bugs in Docker Compose setup.",
          time: "2025-07-16T12:05:00.000Z",
          _id: "6871bbbb45ca91b0d3435f22",
        },
      ],
    },
  };

export default function Inprogress({}) {
  const today = new Date();
  const nextEvalMonth = today.toLocaleString("default", { month: "long" });
  const nextEvalDay = today.getDate();

 

  const latestEvaluation = data.project.evaluations.find(
    (e) => e.time && e.remark
  );
  const latestRemark = latestEvaluation?.remark || "No Remarks are given yet.";

  const scoreEvaluation = data.project.evaluations.find(
    (e) => e.marksgiven !== null && e.marksgiven !== undefined
  );
  const currentScore = scoreEvaluation?.marksgiven ?? "NaN";

  return (
    <div className="inprogress-dashboard">
      <h1>{data.message}</h1>

      <div className="horizontal-flex">
        <ProjectCard name={data.project.name} about={data.project.about} />
        <EvaluationCard evaluations={data.project.evaluations} />
        <div className="guideevaluation-card">
          <div className="guide-card">
            <h2>GUIDE</h2>
            <p>{data.project.guide.name}</p>
          </div>
          <ProgressCard evaluations={data.project.evaluations} />
        </div>
        <NextEvalCard month={nextEvalMonth} day={nextEvalDay} />
      </div>

      <div className="secondblock">
        <TeamCard team={data.project.team} />
        <RemarksCard latestRemark={latestRemark} />
        <ScoreCard score={currentScore} />
      </div>

      <EvaluationDetails
        evaluations={data.project.evaluations}
        latestUpdates={data.project.latestUpdates}
      />

      <AddUpdateCard/>
    </div>
  );
}
