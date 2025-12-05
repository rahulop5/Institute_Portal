import React, { useState, useMemo, useCallback } from "react";
import { Form, useSubmit } from "react-router-dom";
import AddCourseModal from "./AddCourseModal";
import styles from "../styles/CourseHeader.module.css";
import bookIcon from "../../../../assets/books.png";
import trashcan from "../../../../assets/trashcan.png";
import edit from "../../../../assets/edit .png";
import SearchContainer from "./Searchcontainer.jsx";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Added default value for batchWiseCourses
export default function CoursesHeader({ batchWiseCourses = {}, faculty }) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const submit = useSubmit();

  // NEW: State to track the selected batch. "All" is the default.
  const [selectedBatch, setSelectedBatch] = useState("All");

  const handleDeleteCourse = (courseId) => {
    Swal.fire({
      title: 'Are you sure you want to delete?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append("courseId", courseId);
        
        submit(formData, {
          method: "delete"
        });
        
        toast.error("Deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    });
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // NEW: Get a memoized list of batch years to create the buttons
  const batchYears = useMemo(() => {
    return Object.keys(batchWiseCourses).sort((a, b) => b - a); // Sort descending
  }, [batchWiseCourses]);

  // CHANGED: This memo now *only* filters by the search term
  const searchedCoursesByBatch = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    if (!lowerSearch) {
      return batchWiseCourses;
    }

    return Object.entries(batchWiseCourses).reduce((acc, [batch, courses]) => {
      const filteredCoursesInBatch = courses.filter(
        (course) =>
          course.name.toLowerCase().includes(lowerSearch) ||
          course.code.toLowerCase().includes(lowerSearch)
      );

      if (filteredCoursesInBatch.length > 0) {
        acc[batch] = filteredCoursesInBatch;
      }

      return acc;
    }, {});
  }, [batchWiseCourses, searchTerm]);

  // NEW: A second memo to filter based on the *selected batch*
  const coursesToDisplay = useMemo(() => {
    // If "All" is selected, return all the search results
    if (selectedBatch === "All") {
      return searchedCoursesByBatch;
    }

    // If a specific batch is selected, check if it exists in the search results
    if (searchedCoursesByBatch[selectedBatch]) {
      // Return a new object containing *only* that batch's data
      return { [selectedBatch]: searchedCoursesByBatch[selectedBatch] };
    }

    // Otherwise, return an empty object (no courses for this batch)
    return {};
  }, [searchedCoursesByBatch, selectedBatch]);

  // CHANGED: This now checks the final `coursesToDisplay` object
  const hasCourses = Object.keys(coursesToDisplay).length > 0;

  return (
    <div className={styles.container}>
      <ToastContainer />
      
        <div className={styles.header}>
          <h2 className={styles.subHeading}>Courses Overview</h2>
          <SearchContainer
            onSearchChange={handleSearchChange}
            placeholder="Search by Course Name or Code"
          />
        </div>

        {/* NEW: Batch Selector Buttons */}
        <div className={styles.batchSelector}>
          {" "}
          {/* This comment is fine */}
          <button
            onClick={() => setSelectedBatch("All")}
            // SYNTAX ERROR FIXED on this line:
            className={selectedBatch === "All" ? styles.activeButton : ""}
          >
            All
          </button>
          {batchYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedBatch(year)}
              className={selectedBatch === year ? styles.activeButton : ""}
            >
              {year}
            </button>
          ))}
        </div>
       <div className={styles.content}>
        {/* CHANGED: This container now renders based on `coursesToDisplay` */}
        <div className={styles.courseListContainer}>
          {hasCourses ? (
            // This loop now renders "All" batches or a *single* batch
            Object.entries(coursesToDisplay).map(
              ([batchYear, coursesInBatch]) => (
                <div key={batchYear} className={styles.batchSection}>
                  {/* Only show the "Batch XXXX" header if "All" is selected */}
                  {selectedBatch === "All" && (
                    <h3 className={styles.batchHeader}>Batch {batchYear}</h3>
                  )}

                  <div className={styles.grid}>
                    {coursesInBatch.map((course) => (
                      <div key={course.id} className={styles.card}>
                        <div className={styles.topRow}>
                          <div className={styles.courseInfo}>
                            <img
                              src={bookIcon}
                              alt="course"
                              className={styles.courseIcon}
                            />
                            <div>
                              <div className={styles.abbrev}>{course.name}</div>
                              <div className={styles.courseCode}>
                                {course.code}
                              </div>
                            </div>
                          </div>
                          <div className={styles.actions}>
                            <button
                              type="button"
                              className={styles.deleteButton}
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <img
                                src={trashcan}
                                alt="Delete"
                                className={styles.icon}
                              />
                            </button>
                            {/* <button className={styles.editButton}>
                          <img src={edit} alt="Edit" className={styles.iconedit} />
                        </button> */}
                          </div>
                        </div>

                        <div className={styles.stats}>
                          <div className={styles.statBox}>
                            <span className={styles.statLabel}>
                              Faculty Count
                            </span>
                            <span className={styles.statValue}>
                              {course.facultycount}
                            </span>
                          </div>
                          <div className={styles.statBox}>
                            <span className={styles.statLabel}>
                              Class Strength
                            </span>
                            <span className={styles.statValue}>
                              {course.strength}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <p className={styles.noResults}>No courses found.</p>
          )}
        </div>
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

// Delete action function remains unchanged
export async function deleteCourseAction({ request }) {
  // ... (no changes here)
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
