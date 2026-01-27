import React, { useState, useMemo, useCallback } from "react";
import { Form, useSubmit } from "react-router-dom";
import AddCourseModal from "./AddCourseModal";
import styles from "../styles/CourseHeader.module.css";
import bookIcon from "../../../../assets/books.png";
import trashcan from "../../../../assets/trashcan.png";
import edit from "../../../../assets/edit .png";
import SearchContainer from "./Searchcontainer.jsx";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { API_HOST } from "../../../../config";

// Added default value for batchWiseCourses
import { useNavigate } from "react-router-dom";

export default function CoursesHeader({ batchWiseCourses = {}, faculty, adminDepartments }) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const submit = useSubmit();
  const navigate = useNavigate();

  // NEW: State for selected Semester
  const [selectedSemester, setSelectedSemester] = useState("Monsoon");
  
  // NEW: State for selected UG Level (default "All" or can be specific) - let's keep it "All" as default top-level
  const [selectedUG, setSelectedUG] = useState("All");

  const handleDeleteCourse = async (courseId) => {
    const result = await Swal.fire({
      title: 'Are you sure you want to delete?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    });
    
    if (result.isConfirmed) {
      // Show toast immediately
      toast.error("Deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Small delay then submit
      setTimeout(() => {
        const formData = new FormData();
        formData.append("courseId", courseId);
        
        submit(formData, {
          method: "delete"
        });
      }, 500);
    }
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // NEW: Get sorted UG levels
  const ugLevels = useMemo(() => {
    return Object.keys(batchWiseCourses).sort((a, b) => a - b); 
  }, [batchWiseCourses]);

  // CHANGED: Search + Semester Filter
  const filteredCourses = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    
    // Create deep copy/new object structure
    const result = {};

    Object.entries(batchWiseCourses).forEach(([ug, courses]) => {
      // Filter by Semester AND Search Term
      const matchingCourses = courses.filter(course => {
         const matchesSearch = !lowerSearch || 
                              course.name.toLowerCase().includes(lowerSearch) || 
                              course.code.toLowerCase().includes(lowerSearch);
         const matchesSemester = course.semester === selectedSemester;
         
         return matchesSearch && matchesSemester;
      });

      if (matchingCourses.length > 0) {
        result[ug] = matchingCourses;
      }
    });

    return result;
  }, [batchWiseCourses, searchTerm, selectedSemester]);


  // NEW: Filter by selected UG Level for display
  const coursesToDisplay = useMemo(() => {
    if (selectedUG === "All") {
      return filteredCourses;
    }
    if (filteredCourses[selectedUG]) {
      return { [selectedUG]: filteredCourses[selectedUG] };
    }
    return {};
  }, [filteredCourses, selectedUG]);

  const hasCourses = Object.keys(coursesToDisplay).length > 0;

  return (
    <div className={styles.container}>
      
        <div className={styles.header}>
          <h2 className={styles.subHeading}>Courses Overview</h2>
          <SearchContainer
            onSearchChange={handleSearchChange}
            placeholder="Search by Course Name or Code"
          />
        </div>

        {/* Filters Container */}
        <div className={styles.filtersRow}>
            
            {/* Semester Toggle */}
            <div className={styles.toggleContainer}>
               <span className={styles.filterLabel}>Semester:</span>
               {["Monsoon", "Spring"].map(sem => (
                   <button
                       key={sem}
                       onClick={() => setSelectedSemester(sem)}
                       className={`${styles.semesterBtn} ${selectedSemester === sem ? styles.activeButton : ""}`}
                   >
                       {sem}
                   </button>
               ))}
            </div>

            {/* UG Level Selector */}
            {/* Note: Reusing batchSelector class which I updated to fit inside filtersRow */}
            <div className={styles.batchSelector}>
              <span className={styles.filterLabel}>UG Level:</span>
              <button
                onClick={() => setSelectedUG("All")}
                className={selectedUG === "All" ? styles.activeButton : ""}
              >
                All
              </button>
              {ugLevels.map((ug) => (
                <button
                  key={ug}
                  onClick={() => setSelectedUG(ug)}
                  className={selectedUG === ug ? styles.activeButton : ""}
                >
                  UG{ug}
                </button>
              ))}
            </div>
        </div>
       <div className={styles.content}>
        {/* CHANGED: This container now renders based on `coursesToDisplay` */}
        <div className={styles.courseListContainer}>
          {hasCourses ? (
            // This loop now renders "All" batches or a *single* batch
            Object.entries(coursesToDisplay).map(
              ([batchYear, coursesInBatch]) => (
                <div key={batchYear} className={styles.batchSection}>
                  {/* Only show the "UG X" header if "All" is selected */}
                  {selectedUG === "All" && (
                    <h3 className={styles.batchHeader}>UG {batchYear}</h3>
                  )}

                  <div className={styles.grid}>
                    {coursesInBatch.map((course) => (
                      <div 
                        key={course.id} 
                        className={styles.card} 
                        onClick={() => navigate(`${course.id}`)}
                        style={{ cursor: "pointer" }}
                      >
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
                            { <button className={styles.editButton}>
                          <img src={edit} alt="Edit" className={styles.iconedit} />
                        </button> }
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
        <AddCourseModal onClose={() => setShowModal(false)} faculty={faculty} adminDepartments={adminDepartments} />
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
      API_HOST + `/puser/feedback/deletecourse?courseId=${courseId}`,
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

  
  return null;
}
