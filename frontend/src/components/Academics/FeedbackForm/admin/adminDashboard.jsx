import { useState } from "react";
import styles from "../styles/adminDashboard.module.css";
import FacultyHeader from "./FacultyHeader.jsx";
import FacultyDashboard from "../faculty/facultyDashboard.jsx";
import CoursesHeader from "./CourseHeader.jsx";
import StudentHeader from "./StudentHeader.jsx";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("faculty");
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const renderTabContent = () => {
    if (selectedFaculty) {
      return (
        <FacultyDashboard
          facultyData={selectedFaculty}
          onBack={() => setSelectedFaculty(null)}
        />
      );
    }

    switch (activeTab) {
      case "faculty":
        return <FacultyHeader setSelectedFaculty={setSelectedFaculty} />;
      case "students":
        return <StudentHeader />
      case "courses":
        return <CoursesHeader />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      
      {!selectedFaculty && (
        <>
          <h1 className={styles.heading}>Admin Dashboard</h1>

          <div className={styles.feedbackTabs}>
            <button
              onClick={() => setActiveTab("faculty")}
              className={`${styles.tabBtn} ${
                activeTab === "faculty" ? styles.active : ""
              }`}
            >
              Faculty
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`${styles.tabBtn} ${
                activeTab === "students" ? styles.active : ""
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("courses")}
              className={`${styles.tabBtn} ${
                activeTab === "courses" ? styles.active : ""
              }`}
            >
              Courses
            </button>
          </div>
        </>
      )}

      {/* Tab Content */}
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
}
