import React, { useState } from "react";
import AddCourseModal from "./AddCourseModal"; // import the modal component
import styles from "../styles/CourseHeader.module.css";
import bookIcon from "../../../../assets/books.png";
import trashcan from "../../../../assets/trashcan.png";
import edit from "../../../../assets/edit .png";


export default function CoursesHeader({courses, faculty}) {
  const [showModal, setShowModal] = useState(false);
  console.log("Course header courses:", courses);

  return (
    <div className={styles.container}>
      <h2 className={styles.subHeading}>Courses Overview</h2>

      <div className={styles.grid}>
        {courses.map((course, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.topRow}>
              <div className={styles.courseInfo}>
                <img src={bookIcon} alt="course" className={styles.courseIcon} />
                <div>
                  <div className={styles.abbrev}>{course.name}</div>
                  <div className={styles.courseCode}>{course.code}</div>
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
                  {course.facultycount}
                </span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Class Strength</span>
                <span className={styles.statValue}>{course.strength}</span>
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

      {showModal && <AddCourseModal onClose={() => setShowModal(false)} faculty={faculty} />}
    </div>
  );
}
