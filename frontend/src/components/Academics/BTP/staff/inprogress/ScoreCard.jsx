import styles from "../../../../styles/StudentInProgress.module.css";


export default function ScoreCard({ data }) {
  return (
    <div className={styles.scoreCard}>
      <p className={styles.smallLabel}>Current Score</p>
      <h2 className={styles.scoreValue}>
        {data.currentScore.value}
        <span className={styles.outOf}>/{data.currentScore.outOf}</span>
      </h2>
    </div>
  );
}
