import styles from "../../../../styles/StudentInProgress.module.css";

export default function NextEvalCard({ data }) {
  return (
    <div className={styles.dateCard}>
      <p className={styles.smallLabel}>Next Evaluation</p>
      <h2>
        {data.nextEvalDate.month} <br />
        <span className={styles.largeNumber}>{data.nextEvalDate.day}</span>
      </h2>
    </div>
  );
}
