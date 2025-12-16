import { Outlet, Link, useLocation, useMatch } from "react-router-dom"; 
import { useState } from "react"; 
import styles from "../styles/adminDashboard.module.css";

export default function AdminDashboard() {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

const matchFacultyDetail = useMatch("/academics/feedback/admin/faculty/:facultyId");
const matchFacultyStats = useMatch("/academics/feedback/admin/faculty/:facultyId/:courseId");

  
  // This console log will now show an object

  const isFacultyDashboard = matchFacultyDetail || matchFacultyStats;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      {/* This logic is correct! */}
      {!isFacultyDashboard && (
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
      )}

      <div className={styles.tabContent}>
        <Outlet />
      </div>
    </div>
  );
}