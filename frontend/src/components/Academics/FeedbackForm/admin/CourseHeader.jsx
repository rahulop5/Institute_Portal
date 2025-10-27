import React, { useState } from "react";
import AddCourseModal from "./AddCourseModal"; // import the modal component
import styles from "../styles/CourseHeader.module.css";
import bookIcon from "../../../../assets/books.png";
import trashcan from "../../../../assets/trashcan.png";
import edit from "../../../../assets/edit .png";

const coursesList = [
  {
    courseName: "Introduction to Cyber Security",
    courseCode: "CS1021",
    abbreviation: "ICS",
    structure: "Institute Core",
    credits: 3,
    classStrength: 67,
    faculties: [
      "Dr. Abhiram Reddi",
      "Dr. Sahal Ansar Theparambil",
      "Dr. Pavan Karthik XYZ",
      "Dr. Sajja Balaji Sai Surya",
    ],
  },
  {
    courseName: "Data Structures",
    courseCode: "CS201",
    abbreviation: "DS",
    structure: "Program Core",
    credits: 4,
    classStrength: 72,
    faculties: [
      "Dr. Abhiram Reddi",
      "Dr. Venkat Rahul Vempadapu",
      "Dr. Pavan Karthik XYZ",
    ],
  },
  {
    courseName: "Machine Learning",
    courseCode: "CS403",
    abbreviation: "ML",
    structure: "Elective",
    credits: 3,
    classStrength: 54,
    faculties: ["Dr. Sahal Ansar Theparambil", "Dr. Sajja Balaji Sai Surya"],
  },
  {
    courseName: "Software Engineering",
    courseCode: "CS305",
    abbreviation: "SE",
    structure: "Program Core",
    credits: 3,
    classStrength: 65,
    faculties: ["Dr. Pavan Karthik XYZ"],
  },
];

export default function CoursesHeader() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.container}>
      <h2 className={styles.subHeading}>Courses Overview</h2>

      <div className={styles.grid}>
        {coursesList.map((course, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.topRow}>
              <div className={styles.courseInfo}>
                <img src={bookIcon} alt="course" className={styles.courseIcon} />
                <div>
                  <div className={styles.abbrev}>{course.abbreviation}</div>
                  <div className={styles.courseCode}>{course.courseCode}</div>
                </div>
              </div>

              <div className={styles.actions}>
                <img src={trashcan} alt="Delete" className={styles.icon} />
                <img src={edit} alt="Edit" className={styles.iconedit} />
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Faculty Count</span>
                <span className={styles.statValue}>
                  {course.faculties.length}
                </span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Class Strength</span>
                <span className={styles.statValue}>{course.classStrength}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.addcourseBtnContainer}>
        <button
          className={styles.addcourseBtn}
          onClick={() => setShowModal(true)}
        >
          Add Course
        </button>
      </div>

      {showModal && <AddCourseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
