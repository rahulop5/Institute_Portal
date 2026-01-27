import { useState } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import styles from "../styles/CourseDetails.module.css";
import courseIcon from "../../../../assets/math1.png";
import profileIcon from "../../../../assets/studenticon.svg";
import StudentFileModal from "./StudentFileModal";
import FacultySelectModal from "./FacultySelectModal";
import { API_HOST } from "../../../../config"; // Ensure this is imported
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const courseTypes = ["Core", "Program Elective", "Open Elective", "Lab"];

export default function CourseDetails() {
  const navigate = useNavigate();
  const { course, students, allAvailableFaculty } = useLoaderData();
  
  // Transform backend data to expected state format
  const initialCourseData = {
    courseId: course._id,
    courseName: course.name,
    courseCode: course.code,
    courseType: course.coursetype,
    credits: course.credits,
    studentCount: students.length,
    facultyCount: course.faculty.length,
    // Map _id to id for Students
    students: students.map(s => ({ ...s, id: s._id })),
    // Map _id to id for Faculty (course.faculty populated)
    faculty: course.faculty.map(f => ({ ...f, id: f._id })),
  };

  // Map allAvailableFaculty _id to id for Modal
  const mappedAvailableFaculty = allAvailableFaculty.map(f => ({ ...f, id: f._id }));

  // Course data state
  const [courseData, setCourseData] = useState(initialCourseData);
  const [activeTab, setActiveTab] = useState("students"); // "students" or "faculty"
  const [searchQuery, setSearchQuery] = useState("");
  
  // Separate editing states
  const [isEditingCourseInfo, setIsEditingCourseInfo] = useState(false);
  
  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  
  // Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false);

  // Handle input changes for editable fields
  const handleInputChange = (field, value) => {
    setCourseData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  // Handle updating faculty list from FacultySelectModal
  const handleFacultyUpdate = (selectedFacultyList) => {
    setCourseData((prev) => ({
      ...prev,
      faculty: selectedFacultyList,
      facultyCount: selectedFacultyList.length,
    }));
    setHasChanges(true);
  };

  // Handle edit button click based on active tab
  const handleEditClick = () => {
    if (activeTab === "students") {
      setShowStudentModal(true);
    } else {
      setShowFacultyModal(true);
    }
  };

  // Filter participants based on search
  const filteredParticipants = activeTab === "students"
    ? courseData.students.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courseData.faculty.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.department.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle save - send to backend
  const handleSave = async () => {
    try {
        const token = localStorage.getItem("token");
        const payload = {
            courseId: courseData.courseId,
            name: courseData.courseName,
            code: courseData.courseCode,
            coursetype: courseData.courseType,
            credits: courseData.credits,
            faculty: courseData.faculty,
            // ug and semester not editable here currently, but if needed add to state
        };

        const response = await fetch(API_HOST + "/puser/feedback/updateCourseDetails", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": "Bearer " + token 
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to update course");
        }

        toast.success("Course details saved successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setIsEditingCourseInfo(false);
        setHasChanges(false);
        // Optionally reload page to ensure sync
        navigate(0); 

    } catch (err) {
        console.error("Save failed:", err);
        toast.error("Failed to save changes: " + err.message);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page (CourseHeader)
  };

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>Course Details</h1>
        <button className={styles.backButton} onClick={handleBack}>
          <span className={styles.backIcon}>←</span>
          Back to Main Menu
        </button>
      </div>

      {/* Course Info Card */}
      <div className={styles.courseInfoCard}>
        <div className={styles.courseMainInfo}>
          <div className={styles.courseIcon}>
            <img src={courseIcon} alt="Course" />
          </div>
          <div className={styles.courseNameSection}>
            {isEditingCourseInfo ? (
              <>
                <input
                  type="text"
                  className={styles.courseNameInput}
                  value={courseData.courseName}
                  onChange={(e) => handleInputChange("courseName", e.target.value)}
                />
                <input
                  type="text"
                  className={styles.courseCodeInput}
                  value={courseData.courseCode}
                  onChange={(e) => handleInputChange("courseCode", e.target.value)}
                />
              </>
            ) : (
              <>
                <span className={styles.courseName}>{courseData.courseName}</span>
                <span className={styles.courseCode}>{courseData.courseCode}</span>
              </>
            )}
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Course Type</span>
            {isEditingCourseInfo ? (
              <div className={styles.customDropdown}>
                <button
                  type="button"
                  className={styles.dropdownTrigger}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{courseData.courseType}</span>
                  <span className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.dropdownArrowOpen : ''}`}>▾</span>
                </button>
                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    {courseTypes.map((type) => (
                      <div
                        key={type}
                        className={`${styles.dropdownItem} ${courseData.courseType === type ? styles.dropdownItemSelected : ''}`}
                        onClick={() => {
                          handleInputChange("courseType", type);
                          setIsDropdownOpen(false);
                        }}
                      >
                        {type}
                        {courseData.courseType === type && <span className={styles.checkmark}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className={styles.statValue}>{courseData.courseType}</span>
            )}
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Credits</span>
            {isEditingCourseInfo ? (
              <div className={styles.creditInputWrapper}>
                <button
                  type="button"
                  className={styles.creditBtn}
                  onClick={() => handleInputChange("credits", Math.max(1, courseData.credits - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  className={styles.statInput}
                  value={courseData.credits}
                  onChange={(e) => handleInputChange("credits", parseInt(e.target.value) || 0)}
                  min="1"
                  max="10"
                />
                <button
                  type="button"
                  className={styles.creditBtn}
                  onClick={() => handleInputChange("credits", Math.min(10, courseData.credits + 1))}
                >
                  +
                </button>
              </div>
            ) : (
              <span className={styles.statValue}>{courseData.credits}</span>
            )}
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>No. of Students</span>
            <span className={styles.statValue}>{courseData.students.length}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Faculty Count</span>
            <span className={styles.statValue}>{courseData.faculty.length}</span>
          </div>
        </div>
      </div>

      {/* Edit Course Info Button */}
      <div className={styles.editCourseInfoRow}>
        <button
          className={styles.editCourseInfoButton}
          onClick={() => setIsEditingCourseInfo(!isEditingCourseInfo)}
        >
          {isEditingCourseInfo ? "Cancel Editing" : "Edit Course Details"}
        </button>
      </div>

      {/* Participants Section */}
      <div className={styles.participantsSection}>
        <h2 className={styles.sectionTitle}>Course Participants</h2>

        {/* Tabs and Controls */}
        <div className={styles.tabsRow}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === "faculty" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("faculty")}
            >
              Faculty
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "students" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("students")}
            >
              Students
            </button>
          </div>

          <div className={styles.controls}>
            <button className={styles.editButton} onClick={handleEditClick}>
              Edit
            </button>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <div className={styles.tableHeader}>
            <span></span>
            <span>Name</span>
            <span>{activeTab === "students" ? "Roll No." : "Department"}</span>
          </div>

          <div className={styles.tableBody}>
            {filteredParticipants.map((person, index) => (
              <div key={person.id} className={styles.tableRow}>
                <span className={styles.rowNumber}>{index + 1}</span>
                <div className={styles.personInfo}>
                  <div className={styles.avatar}>
                    <img src={profileIcon} alt="Avatar" />
                  </div>
                  <div className={styles.personDetails}>
                    <span className={styles.personName}>{person.name}</span>
                    <span className={styles.personEmail}>{person.email}</span>
                  </div>
                </div>
                <span className={activeTab === "students" ? styles.rollNumber : styles.department}>
                  {activeTab === "students" ? person.rollNumber : person.department}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button - visible when there are changes */}
      {(hasChanges || isEditingCourseInfo) && (
        <div className={styles.saveButtonContainer}>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Changes
          </button>
        </div>
      )}

      {/* Student File Modal */}
      {showStudentModal && (
        <StudentFileModal
          onClose={() => setShowStudentModal(false)}
          apiAction="/puser/feedback/updateCourseStudents"
          extraData={{ courseId: courseData.courseId }}
          onConfirm={() => {
            // Reload page to fetch updated students
             setTimeout(() => navigate(0), 1000);
          }}
        />
      )}

      {/* Faculty Select Modal */}
      {showFacultyModal && (
        <FacultySelectModal
          allFaculty={mappedAvailableFaculty}
          currentlySelected={courseData.faculty.map((f) => f.id)}
          onClose={() => setShowFacultyModal(false)}
          onConfirm={(selectedFacultyList) => {
            handleFacultyUpdate(selectedFacultyList);
            setShowFacultyModal(false);
          }}
        />
      )}
    </div>
  );
}
