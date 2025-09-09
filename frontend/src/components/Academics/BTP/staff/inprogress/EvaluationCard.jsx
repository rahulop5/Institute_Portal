import classes from "../../../../styles/Inprogress.module.css";

export default function EvaluationCard({ evaluations }) {
  function formatDate(isoString) {
    if (!isoString) return "Not Occurred";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); 
  }

  return (
    <div className={classes["evaluation-card"]}>
      <h2>Evaluation</h2>
      {evaluations.map((evalItem, index) => (
        <div key={index} className={classes["evaluation-row"]}>
          <span>Evaluation {index + 1}</span>
          <span>{formatDate(evalItem.time)}</span>
        </div>
      ))}
    </div>
  );
}
