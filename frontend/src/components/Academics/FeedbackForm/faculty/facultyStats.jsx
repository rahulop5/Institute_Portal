import React, { useState } from "react";
import styles from "../styles/facultyStats.module.css";
import DoughnutChartBox from "./DoughnutChartBox";
import LineChartBox from "./LineChartBox";
import FeedbackSection from "./FeedbackSection";
// 1. Import useNavigate
import { useLoaderData, useNavigate } from "react-router";

import { API_HOST } from "../../../../config";


// ... (dummy data is commented out, which is fine) ...

export default function FacultyStatistics() {
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

  // Handler for the new back button
  const handleBack = () => {
    // ".." tells React Router to go one level up in the path
    navigate(".."); 
  };

  return (
    <div className={styles.container}>
      {/* 3. Add the new Back button here */}
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

export async function loader({ params }) {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  switch (role) {
    case "Faculty":
      //add custom logic for batch later using URL
      const response = await fetch(
        API_HOST + `/faculty/feedback/course?courseId=${params.courseId}`,
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const result = await response.json();
        console.log(result);
        throw new Response(
          JSON.stringify({
            message: "Error adding the topic",
          }),
          {
            status: 500,
          }
        );
      }

      const result = await response.json();
      return result;
    //handle other users later
    default:
      throw new Response(
        JSON.stringify({
          message: "Error loading BTP dashboard",
        }),
        {
          status: 500,
        }
      );
  }
}
