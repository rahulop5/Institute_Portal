import classes from "../../../../styles/Inprogress.module.css";

export default function ProgressCard({ evaluations }) {
  const progressPercent = (evaluations.filter(e => e.time).length / 3) * 100;

  return (
    <div className={classes["progress-card"]}>
      <h2>Evaluation Progress</h2>
      <div className={classes["progress-bar-container"]}>
        <div
          className={classes["progress-bar-fill"]}
          style={{ width: `${progressPercent}%` }}
        />
        <div className={classes["progress-tick"]} style={{ left: "33%" }} />
        <div className={classes["progress-tick"]} style={{ left: "66%" }} />
        <div className={classes["progress-tick"]} style={{ left: "99%" }} />
      </div>
    </div>
  );
}
  