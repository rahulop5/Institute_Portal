import { useState } from "react";
import AddFacultyModal from "./AddFacultymodal.jsx";
import styles from "../styles/adminDashboard.module.css";
import profile from "../../../../assets/studenticon.svg";

const facultyList = [
  {
    name: "Dr. Abhiram Reddi",
    avgscore: 9.1,
    impressions: 210,
    coursestaught: 3,
    department: "CSE",
    courses: [
      { name: "Data Structures", coursecode: "CS201", avgscore: 9.2 },
      { name: "OOPS", coursecode: "CS202", avgscore: 8.9 },
      { name: "DBMS", coursecode: "CS303", avgscore: 9.1 },
    ],
  },
  {
    name: "Dr. Sahal Ansar Theparambil",
    avgscore: 8.7,
    impressions: 168,
    coursestaught: 2,
    department: "CSE",
    courses: [
      { name: "AI", coursecode: "CS401", avgscore: 8.9 },
      { name: "ML", coursecode: "CS403", avgscore: 8.6 },
    ],
  },
  {
    name: "Dr. Venkat Rahul Vempadapu",
    avgscore: 6.9,
    impressions: 342,
    coursestaught: 5,
    department: "IT",
    courses: [
      { name: "Web Tech", coursecode: "IT301", avgscore: 7.0 },
      { name: "HCI", coursecode: "IT307", avgscore: 6.7 },
      { name: "Data Mining", coursecode: "IT406", avgscore: 7.1 },
      { name: "Networks", coursecode: "IT402", avgscore: 6.8 },
      { name: "Security", coursecode: "IT405", avgscore: 7.0 },
    ],
  },
  {
    name: "Dr. Shrushant Reddy",
    avgscore: 8.9,
    impressions: 81,
    coursestaught: 1,
    department: "ECE",
    courses: [
      { name: "Digital Logic Design", coursecode: "EC201", avgscore: 8.9 },
    ],
  },
  {
    name: "Dr. Pavan Karthik XYZ",
    avgscore: 9.6,
    impressions: 133,
    coursestaught: 2,
    department: "CSE",
    courses: [
      { name: "Software Engineering", coursecode: "CS305", avgscore: 9.5 },
      { name: "CN", coursecode: "CS308", avgscore: 9.7 },
    ],
  },
  {
    name: "Dr. Sajja Balaji Sai Surya",
    avgscore: 8.2,
    impressions: 293,
    coursestaught: 4,
    department: "CSE",
    courses: [
      { name: "AI", coursecode: "CS401", avgscore: 8.3 },
      { name: "ML", coursecode: "CS403", avgscore: 8.1 },
      { name: "DL", coursecode: "CS407", avgscore: 8.2 },
      { name: "Data Science", coursecode: "CS409", avgscore: 8.2 },
    ],
  },
];

export default function FacultyHeader({ setSelectedFaculty }) {
  const [showModal, setShowModal] = useState(false);

  const handleAddFaculty = (facultyData) => {
    console.log("New Faculty Added:", facultyData);
    // TODO: send to backend or update state here
  };

  return (
    <div>
      <h2 className={styles.subHeading}>Faculty Feedback Overview</h2>

      <div className={styles.grid}>
        {facultyList.map((faculty, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.profileSection}>
              <img src={profile} alt="profile" className={styles.profileImg} />
              <div className={styles.facultyName}>{faculty.name}</div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Average Score</span>
                <span className={styles.statValue}>{faculty.avgscore}</span>
              </div>
              <div className={styles.statBoximpressions}>
                <span className={styles.statLabelimpressions}>Impressions</span>
                <span className={styles.statValue}>{faculty.impressions}</span>
              </div>
              <div className={styles.statBox}>
                <span className={styles.statLabel}>Courses Taught</span>
                <span className={styles.statValue}>
                  {faculty.coursestaught}
                </span>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <button
                className={styles.viewBtn}
                onClick={() => setSelectedFaculty(faculty)}
              >
                View Statistics
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.AddFacultyBtnContainer}>
        <button
          className={styles.addFacultyBtn}
          onClick={() => setShowModal(true)}
        >
          Add Faculty
        </button>
      </div>

      {showModal && (
        <AddFacultyModal
          onClose={() => setShowModal(false)}
          onConfirm={handleAddFaculty}
        />
      )}
    </div>
  );
}
