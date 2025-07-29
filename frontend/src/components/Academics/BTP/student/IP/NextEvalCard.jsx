import classes from "../../../../styles/Inprogress.module.css";

export default function NextEvalCard({ month, day }) {
  return (
    <div className={classes["next-eval-card"]}>
      <h3>{month}</h3>
      <h1>{day}</h1>
      <p>Next Evaluation</p>
    </div>
  );
}
