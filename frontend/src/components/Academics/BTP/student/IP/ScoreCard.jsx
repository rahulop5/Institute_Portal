import classes from "../../../../styles/Inprogress.module.css";

export default function ScoreCard({ currentScore }) {
  return (
    <div className={classes["score-card"]}>
      <h2>Current Score</h2>
      <div className={classes["score-value"]}>
        <div className={classes["score-main"]}>{currentScore}</div>
        <div className={classes["score-outof"]}>/ 50</div>
      </div>
    </div>
  );
}
