import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AddFacultyModal from "./AddFacultymodal.jsx";
import styles from "../styles/adminDashboard.module.css";
import profile from "../../../../assets/studenticon.svg";
import AddFacultyFileModal from "./AddFacultyFileModal.jsx";
import FacultySearch from "./Searchcontainer.jsx";

export default function FacultyHeader({ facultyList }) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleAddFaculty = (facultyData) => {
    console.log("New Faculty Added:", facultyData);
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const filteredFaculty = useMemo(() => {
    return facultyList.filter((faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [facultyList, searchTerm]);

  return (
    <div>
      <div className={styles.header}>
        <h2 className={styles.subHeading}>Faculty Feedback Overview</h2>
        <FacultySearch onSearchChange={handleSearchChange} 
          placeholder="Search by Faculty Name" />
      </div>

      <div className={styles.grid}>
        {filteredFaculty.length > 0 ? (
          filteredFaculty.map((faculty) => (
            <div key={faculty.email} className={styles.card}>
              <div className={styles.profileSection}>
                <img
                  src={profile}
                  alt="profile"
                  className={styles.profileImg}
                />
                <div className={styles.facultyName}>{faculty.name}</div>
              </div>

              <div className={styles.stats}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Average Score</span>
                  <span className={styles.statValue}>{faculty.avgscore}</span>
                </div>
                <div className={styles.statBoximpressions}>
                  <span className={styles.statLabelimpress}>Impressions</span>
                  <span className={styles.statValue}>{faculty.impress}</span>
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
                  onClick={() => navigate(faculty.id)}
                >
                  View Statistics
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noResults}>
            No faculty found matching your search.
          </p>
        )}
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
        <AddFacultyFileModal
          onClose={() => setShowModal(false)}
          onConfirm={handleAddFaculty}
        />
      )}
    </div>
  );
}
