// In AdminDashboard.jsx

import { Outlet, Link, useLocation } from "react-router-dom"; 
import { useState } from "react"; 
import styles from "../styles/adminDashboard.module.css";
import FacultyDashboard from "../faculty/facultyDashboard"; 

export default function AdminDashboard() {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

 

 

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>
      <div className={styles.feedbackTabs}>
        <Link
          to="faculty"
          className={`${styles.tabBtn} ${
            activeTab === "faculty" ? styles.active : ""
          }`}
        >
          Faculty
        </Link>
        <Link
          to="students"
          className={`${styles.tabBtn} ${
            activeTab === "students" ? styles.active : ""
          }`}
        >
          Students
        </Link>
        <Link
          to="courses"
          className={`${styles.tabBtn} ${
            activeTab === "courses" ? styles.active : ""
          }`}
        >
          Courses
        </Link>
      </div>

      <div className={styles.tabContent}>
       

        <Outlet />
      </div>
    </div>
  );
}