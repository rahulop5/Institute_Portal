import styles from "../../../styles/StudentInProgress.module.css";
import Updatelist from "./UpdateList";

export default function StudentInProgress() {
  const data = {
    email: "vihaan.isha1@example.com",
    bin: 1,
    message: "Student Progress Dashboard",
    nextEvalDate: {
      month: "March",
      day: 15,
    },
    currentScore: {
      value: 48,
      outOf: 50,
    },
    project: {
      name: "Deployment Services",
      about:
        "Its a backend service that helps to deploy things using docker etc",
      studentbatch: "2022",
      guide: {
        name: "Dr. Asha Iyer",
        email: "asha.iyer@example.com",
      },
      evaluators: [
        { name: "Dr. Asha Iyer", email: "asha.iyer@example.com" },
        { name: "Dr. Asha Iyer", email: "asha.iyer@example.com" },
      ],
      team: [
        { _id: "1", name: "Vihaan Isha", email: "vihaan.isha1@example.com" },
        { _id: "2", name: "Vivaan Sneha", email: "vivaan.sneha21@example.com" },
        { _id: "3", name: "Diya Sai", email: "diya.sai38@example.com" },
      ],
      evaluations: [
        {},
        {},
        {},
        // { },
      ],
      latestUpdates: [],
    },
  };

  // Derived values
  const evalCount = data.project.evaluations.length;
  const completedCount = data.project.evaluations.filter(
    (e) => e.status === "completed"
  ).length;
  const progressPercent = (completedCount / 4) * 100;
  const phase = evalCount <= 2 ? "Semester 1" : "Semester 2";

  return (
    <>
      <div className={styles.mainGrid}>
        {/* Left side */}
        <div className={styles.leftWrapper}>
          <div className={styles.topContainer}>
            {/* Topic Section */}
            <div className={styles.topicCard}>
              <h2 className={styles.topicTitle}>{data.project.name}</h2>
              <p className={styles.topicDescription}>{data.project.about}</p>
            </div>

            {/* Evaluation Section */}
            <div className={styles.evaluationCard}>
              {[0, 1, 2, 3].map((index) => {
                const isCompleted = index < data.project.evaluations.length;
                return (
                  <div className={styles.evaluationRow} key={index}>
                    <span>
                      <strong>Evaluation {index + 1}</strong>
                    </span>
                    <span
                      className={`${styles.status} ${
                        isCompleted ? styles.completed : styles.pending
                      }`}
                    >
                      <img
                        src={
                          isCompleted
                            ? "/completed-icon.svg"
                            : "/pending-icon.svg"
                        }
                        alt={isCompleted ? "Completed" : "Pending"}
                        className={styles.statusIcon}
                      />
                      <p>{isCompleted ? "Completed" : "Pending"}</p>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.bottomContainer}>
            {/* Members Section */}
            <div className={styles.membersCard}>
              {data.project.team.map((member, index) => (
                <div className={styles.membersrow} key={member._id}>
                  <span>{`Member ${index + 1}`}</span>
                  <span className={styles.icon}>👤 {member.name}</span>
                </div>
              ))}
            </div>

            {/* Guide and Evaluators */}
            <div className={styles.guideEvalGrid}>
              {/* Guide */}
              <div className={styles.guideCard}>
                <span className={styles.label}>Guide</span>
                <span className={styles.guideInfo}>
                  <span className={styles.icon}>👩‍🏫</span>
                  {data.project.guide.name}
                </span>
              </div>

              {/* Evaluators */}
              <div className={styles.evaluatorCard}>
                {data.project.evaluators.map((evalr, i) => (
                  <div className={styles.evaluatorRow} key={i}>
                    <span className={styles.label}>Evaluator {i + 1}</span>
                    <span className={styles.evaluatorInfo}>
                      <span className={styles.icon}>👤</span> {evalr.name}
                    </span>
                  </div>
                ))}
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

          {/* Evaluation Date + Score */}
          <div className={styles.evalScoreGrid}>
            <div className={styles.dateCard}>
              <p className={styles.smallLabel}>Next Evaluation</p>
              <h2>
                {data.nextEvalDate.month} <br />
                <span className={styles.largeNumber}>
                  {data.nextEvalDate.day}
                </span>
              </h2>
            </div>

            <div className={styles.scoreCard}>
              <p className={styles.smallLabel}>Current Score</p>
              <h2 className={styles.scoreValue}>
                {data.currentScore.value}
                <span className={styles.outOf}>/{data.currentScore.outOf}</span>
              </h2>
            </div>
          </div>

          {/* Phase */}
          <div className={styles.phaseCard}>
            <p className={styles.smallLabel}>Phase</p>
            <h2>{phase}</h2>
          </div>
        </div>
      </div>
      <Updatelist />
    </>
  );
}
