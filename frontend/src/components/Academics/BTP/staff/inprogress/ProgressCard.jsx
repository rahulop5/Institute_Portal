import styles from "../../../../styles/StudentInProgress.module.css";


export default function ProgressCard({ data }) {
  // const progressPercent = (evaluations.filter(e => e.time).length / 3) * 100;

  return (
              <div className={styles.progressCard}>
                <h3 className={styles.cardHeading}>Evaluation Progress</h3>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${(data.project.evaluations.length / 4) * 100}%`,
                    }}
                  ></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`${styles.checkpoint} ${
                        data.project.evaluations.length >= i
                          ? styles.activeCheckpoint
                          : ""
                      }`}
                      style={{ left: `${(i / 4) * 100}%` }}
                    ></div>
                  ))}
                </div>
              </div>
  );
}
  