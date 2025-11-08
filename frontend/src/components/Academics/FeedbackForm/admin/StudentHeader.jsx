import { useState, useMemo, useCallback } from "react";
import styles from "../styles/StudentHeader.module.css";
import download from "../../../../assets/studenticon.svg";
import SearchContainer from "./SearchContainer";
import StudentFileModal from "./StudentFileModal";

export default function StudentHeader({ students }) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 3. Create the callback function for the search component
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // 4. Create the filtered list based on the search term
  //    This logic searches name, email, and roll number.
  const filteredStudents = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerSearch) ||
        student.email.toLowerCase().includes(lowerSearch) ||
        student.rollNumber.toLowerCase().includes(lowerSearch)
    );
  }, [students, searchTerm]);

  const exportCSV = () => {
    const csvHeader = "Name,Email,Roll No.,Year of Study\n";
    // 5. Use 'filteredStudents' for the CSV export
    const csvRows = filteredStudents
      .map((s) => `${s.name},${s.email},${s.rollNumber},${s.batch}`)
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "unregistered_students.csv";
    link.click();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.title}>Unsubmitted Students:</p>

        {/* 6. Add the SearchContainer component */}
        <SearchContainer
          onSearchChange={handleSearchChange}
          placeholder="Search by Name, Email, or Roll No."
        />
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Year of Study</th>
            </tr>
          </thead>
          <tbody>
            {/* 7. Map over 'filteredStudents' instead of 'students' */}
            {filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => (
                <tr key={idx}>
                  <td className={styles.index}>{s.id}</td>
                  <td className={styles.nameCell}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        <img src={download} alt="avatar" />
                      </div>
                      <div>
                        <div className={styles.name}>{s.name}</div>
                        <div className={styles.email}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{s.rollNumber}</td>
                  <td>{s.batch}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.noResults}>
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.exportRow}>
        <button className={styles.exportBtn} onClick={exportCSV}>
          Export as .csv
        </button>
        <button className={styles.exportBtn} onClick={() => setShowModal(true)}>
          Add Students
        </button>
      </div>

      {showModal && (
        <StudentFileModal
          onClose={() => setShowModal(false)}
          onConfirm={() => {}}
        />
      )}
    </div>
  );
}
