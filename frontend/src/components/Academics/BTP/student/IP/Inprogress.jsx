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
import { redirect } from "react-router";
import classes from "../../../../styles/Inprogress.module.css";

export default function Inprogress({ data }) {
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
    <div className={classes["inprogress-dashboard"]}>
      <h1>{data.message}</h1>

      <div className={classes["horizontal-flex"]}>
        <ProjectCard name={data.project.name} about={data.project.about} />
        <EvaluationCard evaluations={data.project.evaluations} />
        <div className={classes["guideevaluation-card"]}>
          <div className={classes["guide-card"]}>
            <h2>GUIDE</h2>
            <p>{data.project.guide.name}</p>
          </div>
          <ProgressCard evaluations={data.project.evaluations} />
        </div>
        <NextEvalCard month={nextEvalMonth} day={nextEvalDay} />
      </div>

      <div className={classes["secondblock"]}>
        <TeamCard team={data.project.team} />
        <RemarksCard latestRemark={latestRemark} />
        <ScoreCard score={currentScore} />
      </div>

      <EvaluationDetails
        evaluations={data.project.evaluations}
        latestUpdates={data.project.latestUpdates}
      />

      {/* to make sure it clears the state */}
      {data.bin === 1 ? <AddUpdateCard key={Date.now()} /> : null}
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const updateDataJSON = formData.get("update");
  const token = localStorage.getItem("token");

  const reqdata = {
    update: updateDataJSON,
  };

  const response = await fetch("http://localhost:3000/student/btp/addupdate", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqdata),
  });

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Error sending team request",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();
  console.log(response);

  return redirect("/academics/btp/student");
}
