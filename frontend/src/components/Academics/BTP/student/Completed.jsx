import styles from "../../../styles/Completed.module.css";

export default function Completed({ data }) {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>BTP Completed</h1>
      <div className={styles.card}>
        <h2 className={styles.topicTitle}>{data.project.name}</h2>
        <p className={styles.topicDescription}>{data.project.about}</p>
      </div>
      <p className={styles.message}>{data.message}</p>
    </div>
  );
}
