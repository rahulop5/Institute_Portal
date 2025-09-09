import styles from "../../../../styles/StudentInProgress.module.css";


export default function ProjectCard({data}) {
  return (
    <div className={styles.topicCard}>
      <h2 className={styles.topicTitle}>{data.project.name}</h2>
      <p className={styles.topicDescription}>{data.project.about}</p>
    </div>
  );
}
