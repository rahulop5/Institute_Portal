import React, { useState } from "react";
import styles from "../styles/facultyStats.module.css";
import DoughnutChartBox from "./DoughnutChartBox";
import LineChartBox from "./LineChartBox";
import FeedbackSection from "./FeedbackSection";

import { useLoaderData, useNavigate,useParams } from "react-router";

import { API_HOST } from "../../../../config";

export default function AdminFacultyStatistics() {
  const data = useLoaderData();
  const navigate = useNavigate(); // 2. Get the navigate function
  console.log(data);
  const [activeTab, setActiveTab] = useState("course");
  const {
    name,
    coursecode,
    avgscore,
    responses,
    questions,
    min,
    max,
    feedback,
  } = data;

  const { facultyId } = useParams();

  const handleBack = () => {
    navigate(`/academics/feedback/admin/faculty/${facultyId}`);
  };
  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={handleBack}>
        ← Back to Faculty Overview
      </button>

      <h2 className={styles.heading}>Feedback Form Overview</h2>

      <div className={styles.topSection}>
        {/* ... (rest of your component) ... */}
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

// This is the new, admin-specific loader
export async function adminCourseStatisticsLoader({ params }) {
  const token = localStorage.getItem("token");
  const { facultyId, courseId } = params;

  // Call your admin endpoint
  const response = await fetch(
    API_HOST + `/puser/feedback/viewFacultyCourseStatistics?facultyId=${facultyId}&courseId=${courseId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch course statistics.");
  }

  // The component expects the data object directly
  const resData = await response.json();
  return resData;
}
