import styles from '../../../styles/StudentInProgress.module.css';

export default function StudentInProgress() {
  return (
    <div className={styles.mainGrid}>
      
      {/* Left side: Top + Bottom */}
      <div className={styles.leftWrapper}>
        <div className={styles.topContainer}>
          {/* Topic Section */}
          <div className={styles.topicCard}>
            <h2 className={styles.topicTitle}>Artificial Neural Networks</h2>
            <p className={styles.topicDescription}>
              Developing innovative and seamless ways for people and devices to interact, 
              share information, and stay meaningfully connected in an increasingly digital world.
            </p>
          </div>

          {/* Evaluation Section */}
          <div className={styles.evaluationCard}>
            <div className={styles.evaluationRow}>
              <span>Evaluation 1</span>
              <span className={`${styles.status} ${styles.completed}`}>✔ Completed</span>
            </div>
            <div className={styles.evaluationRow}>
              <span>Evaluation 2</span>
              <span className={`${styles.status} ${styles.pending}`}>⏳ Pending</span>
            </div>
            <div className={styles.evaluationRow}>
              <span>Evaluation 3</span>
              <span className={`${styles.status} ${styles.unavailable}`}>— Unavailable</span>
            </div>
          </div>
        </div>

        <div className={styles.bottomContainer}>
          {/* Members Section */}
          <div className={styles.membersCard}>
            <h3 className={styles.cardHeading}>Members</h3>
            <ul className={styles.memberList}>
              <li><span className={styles.icon}>👤</span> Venkat Rahul Vempadapu</li>
              <li><span className={styles.icon}>👤</span> Abhiram Reddi</li>
              <li><span className={styles.icon}>👤</span> Sahal Ansar Theparambil</li>
            </ul>
          </div>

          {/* Guide and Evaluators */}
          <div className={styles.guideEvalGrid}>
            <div className={styles.guideCard}>
              <h3 className={styles.cardHeading}>Guide</h3>
              <p><span className={styles.icon}>👩‍🏫</span> Dr. Annushree Bablani</p>
            </div>

            <div className={styles.evaluatorCard}>
              <h3 className={styles.cardHeading}>Evaluators</h3>
              <p><span className={styles.icon}>👨‍⚖️</span> Dr. Amilpur Santhosh</p>
              <p><span className={styles.icon}>👨‍⚖️</span> Dr. Pavan Kumar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className={styles.rightContainer}>
        {/* Progress Bar */}
        <div className={styles.progressCard}>
          <h3 className={styles.cardHeading}>Evaluation Progress</h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}></div>
            <div className={styles.checkpoint} style={{ left: '33%' }}></div>
            <div className={styles.checkpoint} style={{ left: '66%' }}></div>
            <div className={styles.checkpoint} style={{ left: '100%' }}></div>
          </div>
        </div>

        {/* Evaluation Date + Score */}
        <div className={styles.evalScoreGrid}>
          <div className={styles.dateCard}>
            <p className={styles.smallLabel}>Next Evaluation</p>
            <h2>March <br /> <span className={styles.largeNumber}>15</span></h2>
          </div>

          <div className={styles.scoreCard}>
            <p className={styles.smallLabel}>Current Score</p>
            <h2 className={styles.scoreValue}>48<span className={styles.outOf}>/50</span></h2>
          </div>
        </div>

        {/* Phase Badge */}
        <div className={styles.phaseCard}>
          <p className={styles.smallLabel}>Phase</p>
          <h2>Semester 1</h2>
        </div>
      </div>
    </div>
  );
}
