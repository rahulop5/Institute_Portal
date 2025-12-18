import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/CourseDetails.module.css";
import courseIcon from "../../../../assets/math1.png";
import profileIcon from "../../../../assets/studenticon.svg";
import StudentFileModal from "./StudentFileModal";
import FacultySelectModal from "./FacultySelectModal";

// Dummy data for all available faculty - will come from API
const allAvailableFaculty = [
  { id: 1, name: "Dr. Ramesh Kumar", email: "ramesh.k@iiits.in", department: "CSE" },
  { id: 2, name: "Dr. Priya Sharma", email: "priya.s@iiits.in", department: "CSE" },
  { id: 3, name: "Dr. Anil Verma", email: "anil.v@iiits.in", department: "CSE" },
  { id: 4, name: "Dr. Sneha Gupta", email: "sneha.g@iiits.in", department: "ECE" },
  { id: 5, name: "Dr. Vikram Singh", email: "vikram.s@iiits.in", department: "ECE" },
  { id: 6, name: "Dr. Kavya Nair", email: "kavya.n@iiits.in", department: "MDS" },
  { id: 7, name: "Dr. Rajesh Menon", email: "rajesh.m@iiits.in", department: "CSE" },
  { id: 8, name: "Dr. Lakshmi Iyer", email: "lakshmi.i@iiits.in", department: "MDS" },
];

// Dummy data - will be replaced with API data later
const dummyCourseData = {
  courseId: "CS2018",
  courseName: "Theory of Computation",
  courseCode: "CS2018",
  courseType: "Program Elective",
  credits: 4,
  studentCount: 243,
  facultyCount: 3,
  students: [
    { id: 1, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 2, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 3, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 4, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 5, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 6, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
    { id: 7, name: "Sahal Ansar Theparambil", email: "sahalansar.t23@iiits.in", rollNumber: "S20230010210" },
  ],
  faculty: [
    { id: 1, name: "Dr. Ramesh Kumar", email: "ramesh.k@iiits.in", department: "CSE" },
    { id: 2, name: "Dr. Priya Sharma", email: "priya.s@iiits.in", department: "CSE" },
    { id: 3, name: "Dr. Anil Verma", email: "anil.v@iiits.in", department: "CSE" },
  ],
};

const courseTypes = ["Core", "Program Elective", "Open Elective", "Lab"];

export default function CourseDetails() {
  const navigate = useNavigate();
  
  // Course data state
  const [courseData, setCourseData] = useState(dummyCourseData);
  const [activeTab, setActiveTab] = useState("students"); // "students" or "faculty"
  const [searchQuery, setSearchQuery] = useState("");
  
  // Separate editing states
  const [isEditingCourseInfo, setIsEditingCourseInfo] = useState(false);
  
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

  // Handle save - will be connected to API later
  const handleSave = async () => {
    console.log("Saving course data:", courseData);
    // TODO: Send data to backend
    // const response = await fetch(API_HOST + "/admin/feedback/updateCourse", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    //   body: JSON.stringify(courseData),
    // });
    alert("Course data saved! (API integration pending)");
    setIsEditingCourseInfo(false);
    setHasChanges(false);
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
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Course Type</span>
              {isEditingCourseInfo ? (
                <select
                  className={styles.statSelect}
                  value={courseData.courseType}
                  onChange={(e) => handleInputChange("courseType", e.target.value)}
                >
                  {courseTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              ) : (
                <span className={styles.statValue}>{courseData.courseType}</span>
              )}
            </div>

            <div className={styles.statCard}>
              <span className={styles.statLabel}>Credits</span>
              {isEditingCourseInfo ? (
                <input
                  type="number"
                  className={styles.statInput}
                  value={courseData.credits}
                  onChange={(e) => handleInputChange("credits", parseInt(e.target.value) || 0)}
                  min="1"
                  max="10"
                />
              ) : (
                <span className={styles.statValue}>{courseData.credits}</span>
              )}
            </div>
          </div>

          <div className={styles.statsRow}>
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
              {activeTab === "students" ? "Edit Students" : "Edit Faculty"}
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
          onConfirm={() => {
            setHasChanges(true);
            setShowStudentModal(false);
          }}
        />
      )}

      {/* Faculty Select Modal */}
      {showFacultyModal && (
        <FacultySelectModal
          allFaculty={allAvailableFaculty}
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
