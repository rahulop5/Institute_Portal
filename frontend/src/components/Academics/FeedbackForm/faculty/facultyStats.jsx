import React, { useState } from "react";
import styles from "../styles/facultyStats.module.css";
import DoughnutChartBox from "./DoughnutChartBox";
import LineChartBox from "./LineChartBox";
import FeedbackSection from "./FeedbackSection";

const data = {
  name: "Theory of Computation",
  coursecode: "CS2018",
  coursetype: "Institute Core Course",
  avgscore: 7.8,
  responses: {
    submitted: 73,
    yettosubmit: 18,
  },
  questions: [
    { qno: 1, avgscore: 7.6 },
    { qno: 2, avgscore: 6.8 },
    { qno: 3, avgscore: 8.1 },
    { qno: 4, avgscore: 7.2 },
    { qno: 5, avgscore: 6.9 },
    { qno: 6, avgscore: 8.3 },
    { qno: 7, avgscore: 4.6 },
    { qno: 8, avgscore: 8.5 },
    { qno: 9, avgscore: 8.9 },
    { qno: 10, avgscore: 7.7 },
    { qno: 11, avgscore: 7.1 },
    { qno: 12, avgscore: 6.4 },
    { qno: 13, avgscore: 7.9 },
    { qno: 14, avgscore: 8.2 },
    { qno: 15, avgscore: 7.0 },
  ],
  min: { score: 4.6, question: 7 },
  max: { score: 8.9, question: 9 },
  feedback: {
    course: [
      {
        date: "13/02/24",
        text: "The course content was well-structured and easy to follow. Real-world examples helped me grasp the concepts better.",
        score: 9.2,
      },
      {
        date: "13/02/24",
        text: "Some topics were a bit rushed toward the end. More time for theorems and proofs would be helpful.",
        score: 6.8,
      },
    ],
    faculty: [
      {
        date: "13/02/24",
        text: "The faculty explained each topic clearly and handled queries patiently.",
        score: 9.1,
      },
      {
        date: "13/02/24",
        text: "Lectures were sometimes too fast-paced, especially during the later chapters.",
        score: 5.9,
      },
    ],
  },
};

export default function FacultyStatistics() {
  const [activeTab, setActiveTab] = useState("course");
  const { name, coursecode, avgscore, responses, questions, min, max, feedback } =
    data;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Feedback Form Overview</h2>

      
      <div className={styles.topSection}>
        <div className={styles.courseBox}>
          <div className={styles.courseInfo}>
            <h3 className={styles.courseTitle}>{name}</h3>
            <p className={styles.courseCode}>{coursecode}</p>
          </div>
        </div>

        <div className={styles.infoBoxes}>
          <div className={styles.infoCard}>
            <div className={styles.scoreTop}>
              <h2>{avgscore}</h2>
            </div>
            <p className={styles.label}>Average Score</p>
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.number}>{responses.submitted}</h2>
            <p className={styles.label}>Responses</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <h3 className={styles.subHeading}>Data & Analytics</h3>
      <div className={styles.analyticsGrid}>
        <DoughnutChartBox responses={responses} min={min} max={max} />
        <LineChartBox questions={questions} />
      </div>

      {/* Feedback */}
      <h3 className={styles.subHeading}>Feedback & Suggestions</h3>
      <FeedbackSection
        feedback={feedback}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
