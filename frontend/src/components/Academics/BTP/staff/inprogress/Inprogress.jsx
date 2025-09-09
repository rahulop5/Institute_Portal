import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProgressCard from "./ProgressCard";
import NextEvalCard from "./NextEvalCard";
import TeamCard from "./TeamCard";
import ScoreCard from "./ScoreCard";
import UpdateCard from "./UpdateCard";
import styles from "../../../../styles/StudentInProgress.module.css";
import completedIcon from "../../../../../assets/completed.svg";
import pendingIcon from "../../../../../assets/pendingsvg.svg";
import studenitcon from "../../../../../assets/studenticon.svg";

// Import Modal
import AddEvaluatorModal from "./AddEvaluatorModal";

export const data = {
  project: {
    name: "AI-Powered Smart Attendance System",
    about:
      "A project that uses facial recognition to automate student attendance tracking and integrates with the academic portal.",
    updates: [
      {
        time: "2024-02-13T10:00:00Z",
        update:
          "Added dropout between layers to reduce overfitting. Switched to Adam optimizer. Accuracy and F1-score set as evaluation metrics.",
      },
      {
        time: "2024-04-29T14:00:00Z",
        update:
          "Enabled batch training with size 64. Xavier initialization applied to weights. Validation loss tracked after each epoch.",
      },
      {
        time: "2025-09-05T09:30:00Z",
        update:
          "Successfully integrated OpenCV-based recognition with attendance database.",
      },
      {
        time: "2025-09-02T14:15:00Z",
        update: "Implemented JWT authentication for student login.",
      },
    ],
    evaluations: [
      {
        time: "2025-07-01T10:00:00Z",
        remark: "Good progress in Phase 1",
        marksgiven: 25,
      },
      {
        time: "2025-08-05T10:00:00Z",
        remark: "Prototype is functional",
        marksgiven: 28,
      },
      {
        time: "2025-09-01T10:00:00Z",
        remark: "Need to refine accuracy levels",
        marksgiven: 30,
      },
    ],
    team: [
      { _id: "s1", name: "Krishna Anika" },
      { _id: "s2", name: "Rahul Mehta" },
      { _id: "s3", name: "Sneha Iyer" },
    ],
    guide: { name: "Dr. Priya Sharma" },
    evaluators: [], // Initially empty
    latestUpdates: [
      {
        title: "Facial recognition module integrated",
        description:
          "Successfully integrated OpenCV-based recognition with attendance database.",
        timestamp: "2025-09-05T09:30:00Z",
      },
      {
        title: "Backend API secured",
        description: "Implemented JWT authentication for student login.",
        timestamp: "2025-09-02T14:15:00Z",
      },
    ],
  },
  nextEvalDate: { month: "September", day: 15 },
  currentScore: { value: 83, outOf: 100 },
  bin: 1,
};

export default function Inprogressstaff() {
  const [evaluators, setEvaluators] = useState(data.project.evaluators);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const today = new Date();
  const evalCount = data.project.evaluations.length;
  const phase = evalCount <= 2 ? "Semester 1" : "Semester 2";

  // Handle confirm from modal
  const handleAddEvaluator = (faculty) => {
    setEvaluators((prev) => {
      const updated = [...prev];
      updated[selectedSlot] = faculty; // put evaluator in the clicked slot
      return updated;
    });
  };

  return (
    <>
      <div className={styles.mainGrid}>
        {/* Left side */}
        <div className={styles.leftWrapper}>
          <div className={styles.topContainer}>
            {/* Topic Section */}
            <ProjectCard data={data} />

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
                            alt={isCompleted ? "Completed" : "Pending...."}
                            className={styles.statusIcon}
                          />
                        </div>
                        <div className={styles.statusTextWrapper}>
                          <p>{isCompleted ? "Completed" : "Pending...."}</p>
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
            <TeamCard data={data} />

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
              <div className={styles.evaluatorCard} style={{ minHeight: "8vh" }}>
                {[0, 1].map((index) => {
                  const evalr = evaluators[index]; // from state
                  return (
                    <div className={styles.evaluatorRow} key={index}>
                      <span className={styles.labeleval}>
                        Evaluator {index + 1}
                      </span>
                      <div className={styles.evaluatorInfo}>
                        {evalr ? (
                          <>
                            <div className={styles.iconWrapper}>
                              <img
                                src={studenitcon}
                                alt="Evaluator Icon"
                                className={styles.evaluatorIcon}
                              />
                            </div>
                            <div className={styles.nameWrapper}>
                              {evalr.name}
                            </div>
                          </>
                        ) : (
                          <button
                            className={styles.addEvaluatorBtn}
                            onClick={() => {
                              setSelectedSlot(index); // which slot clicked
                              setModalOpen(true); // open modal
                            }}
                          >
                            Add Evaluator
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className={styles.rightContainer}>
          <ProgressCard data={data} />

          <div className={styles.evalScoreGrid}>
            <NextEvalCard data={data} />
            <ScoreCard data={data} />
          </div>

          <div className={styles.phaseCard}>
            <p className={styles.smallLabel}>Phase</p>
            <h2>{phase}</h2>
          </div>
        </div>
      </div>

      <UpdateCard data={data} />

      {/* Modal Integration */}
      <AddEvaluatorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAddEvaluator}
      />
    </>
  );
}
