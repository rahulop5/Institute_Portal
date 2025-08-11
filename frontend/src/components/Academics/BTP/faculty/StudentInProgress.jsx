import { useLoaderData } from "react-router";
import styles from "../../../styles/StudentInProgress.module.css";
import Updatelist from "./UpdateList";
import completedIcon from "../../../../assets/completed.svg";
import pendingIcon from "../../../../assets/pendingsvg.svg";
import studenitcon from "../../../../assets/studenticon.svg";

export default function StudentInProgress() {
  const data = useLoaderData();
  // Derived values
  const evalCount = data.project.evaluations.length;
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
                      <div className={styles.statusContent}>
                        <div className={styles.statusIconWrapper}>
                          <img
                            src={isCompleted ? completedIcon : pendingIcon}
                            alt={isCompleted ? "Completed" : "Pending"}
                            className={styles.statusIcon}
                          />
                        </div>
                        <div className={styles.statusTextWrapper}>
                          <p>{isCompleted ? "Completed" : "Pending"}</p>
                        </div>
                      </div>
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
                  <span>
                    <strong>{`Member ${index + 1} `}</strong>
                  </span>
                  <span className={styles.icon}>
                    <img
                      src={studenitcon}
                      alt="User Icon"
                      className={styles.userIcon}
                    />
                    {member.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Guide and Evaluators */}
            <div className={styles.guideEvalGrid}>
              {/* Guide */}
              <div className={styles.guideCard}>
                <span className={styles.label}>Guide</span>
                <div className={styles.guideInfo}>
                  <div className={styles.iconWrapper}>
                    <img
                      src={studenitcon}
                      alt="Guide Icon"
                      className={styles.guideIcon}
                    />
                  </div>
                  <div className={styles.nameWrapper}>
                    {data.project.guide.name}
                  </div>
                </div>
              </div>

              {/* Evaluators */}
              <div className={styles.evaluatorCard}>
                {data.project.evaluators.map((evalr, i) => (
                  <div className={styles.evaluatorRow} key={i}>
                    <span className={styles.labeleval}>Evaluator {i + 1}</span>
                    <div className={styles.evaluatorInfo}>
                      <div className={styles.iconWrapper}>
                        <img
                          src={studenitcon}
                          alt="Evaluator Icon"
                          className={styles.evaluatorIcon}
                        />
                      </div>
                      <div className={styles.nameWrapper}>{evalr.name}</div>
                    </div>
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
      <Updatelist updates={data.project.latestUpdates} />
    </>
  );
}

export async function loader({ params }) {
  const { projid } = params;
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/faculty/btp/viewproject?projid=${projid}`, {
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Response("Failed to load project", { status: response.status });
  }
  const data = await response.json();
  return data;
}
