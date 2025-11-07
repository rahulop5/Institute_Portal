import React from "react";
import styles from "../styles/facultyStats.module.css";

export default function FeedbackSection({ feedback, activeTab, setActiveTab }) {
  const currentFeedback =
    activeTab === "course" ? feedback.course : feedback.faculty;
  console.log(currentFeedback)

  return (
    <>
      <div className={styles.feedbackTabs}>
        <button
          onClick={() => setActiveTab("course")}
          className={`${styles.tabBtn} ${
            activeTab === "course" ? styles.active : ""
          }`}
        >
          Course Feedback
        </button>
        <button
          onClick={() => setActiveTab("faculty")}
          className={`${styles.tabBtn} ${
            activeTab === "faculty" ? styles.active : ""
          }`}
        >
          Faculty Feedback
        </button>
      </div>

      <div className={styles.feedbackTable}>
        <div className={styles.tableHeader}>
          <span>Date</span>
          <span>Feedback</span>
          <span>Score</span>
        </div>

        {currentFeedback.map((f, index) => (
          <div key={index} className={styles.feedbackRow}>
            <span className={styles.date}>{f.date}</span>
            <p className={styles.feedbackText}>{f.text}</p>
            <div
              className={`${styles.scoreBadge} ${
                f.score >= 8
                  ? styles.high
                  : f.score >= 6
                  ? styles.medium
                  : styles.low
              }`}
            >
              {f.score}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
