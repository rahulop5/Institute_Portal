import React, { useState, useMemo, useCallback } from "react"; // 1. Import hooks
import { Form } from "react-router-dom";
import AddCourseModal from "./AddCourseModal";
import styles from "../styles/CourseHeader.module.css";
import bookIcon from "../../../../assets/books.png";
import trashcan from "../../../../assets/trashcan.png";
import edit from "../../../../assets/edit .png";
import SearchContainer from "./Searchcontainer.jsx";

export default function CoursesHeader({ courses, faculty }) {
  const [showModal, setShowModal] = useState(false);
  // 3. Add state for the search term
  const [searchTerm, setSearchTerm] = useState("");
  console.log("Course header courses:", courses);

  // 4. Create the callback for the search component
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // 5. Create the filtered list based on the search term
  const filteredCourses = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(lowerSearch) ||
        course.code.toLowerCase().includes(lowerSearch)
    );
  }, [courses, searchTerm]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.subHeading}>Courses Overview</h2>

        {/* 6. Add the SearchContainer component */}
        <SearchContainer
          onSearchChange={handleSearchChange}
          placeholder="Search by Course Name or Code"
        />
      </div>

      <div className={styles.grid}>
        {/* 7. Map over 'filteredCourses' */}
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.topRow}>
                <div className={styles.courseInfo}>
                  <img
                    src={bookIcon}
                    alt="course"
                    className={styles.courseIcon}
                  />
                  <div>
                    <div className={styles.abbrev}>{course.name}</div>
                    <div className={styles.courseCode}>{course.code}</div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <Form
                    method="delete"
                    onSubmit={(event) => {
                      if (
                        !confirm("Are you sure you want to delete this course?")
                      ) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="courseId" value={course.id} />
                    <button type="submit" className={styles.deleteButton}>
                      <img
                        src={trashcan}
                        alt="Delete"
                        className={styles.icon}
                      />
                    </button>
                  </Form>
                  <button className={styles.editButton}>
                    <img src={edit} alt="Edit" className={styles.iconedit} />
                  </button>
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
          ))
        ) : (
          
          <p className={styles.noResults}>No courses found.</p>
        )}
      </div>

      <div className={styles.addcourseBtnContainer}>
        <button
          className={styles.addcourseBtn}
          onClick={() => setShowModal(true)}
        >
          Add Course
        </button>
      </div>

      {showModal && (
        <AddCourseModal onClose={() => setShowModal(false)} faculty={faculty} />
      )}
    </div>
  );
}

export async function deleteCourseAction({ request }) {
  let token;
  let courseId;

  try {
    token = localStorage.getItem("token");
    const formData = await request.formData();
    courseId = formData.get("courseId");

    if (!courseId) {
      throw new Error("Course ID is required to delete.");
    }
  } catch (err) {
    console.error("Error processing form data:", err);
    throw err;
  }

  let response;
  try {
    response = await fetch(
      `http://localhost:3000/puser/feedback/deletecourse?courseId=${courseId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
  } catch (err) {
    console.error("Fetch failed:", err);
    throw new Error("Network error or server unavailable. (Check CORS?)");
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (err) {
      console.error("Failed to parse error response as JSON:", err);
      const errorText = await response.text();
      throw new Error(
        `Server error (Status: ${response.status}): ${
          errorText || "Could not delete course."
        }`
      );
    }
    throw new Error(errorData.message || "Could not delete the course.");
  }

  console.log("Course deleted successfully");
  return null;
}
