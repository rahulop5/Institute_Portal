// AddEvaluatorModal.jsx
import React, { useState } from "react";
import styles from "../styles/AddEvaluatorModal.module.css";

const dummyFaculty = [
  { id: 1, name: "Dr. Abhiram Reddi", email: "abhiram@univ.edu", empNo: "E1001" },
  { id: 2, name: "Dr. Sahal Ansar Theparambil", email: "sahal@univ.edu", empNo: "E1002" },
  { id: 3, name: "Dr. Sai Tej", email: "saitej@univ.edu", empNo: "E1003" },
  { id: 4, name: "Dr. Venkat Rahul Vempadapu", email: "rahul@univ.edu", empNo: "E1004" },
];

export default function AddEvaluatorModal({ isOpen, onClose, onConfirm }) {
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2>Add Evaluator</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search bar */}
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>

        {/* Faculty list */}
        <div className={styles.tableWrapper}>
          <table className={styles.facultyTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Emp. Number</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dummyFaculty.map((faculty) => (
                <tr key={faculty.id}>
                  <td>{faculty.name}</td>
                  <td>{faculty.empNo}</td>
                  <td>
                    <button
                      className={`${styles.selectBtn} ${
                        selectedFaculty?.id === faculty.id
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => setSelectedFaculty(faculty)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Confirm */}
        <div className={styles.modalFooter}>
          <button
            className={styles.confirmBtn}
            disabled={!selectedFaculty}
            onClick={() => {
              onConfirm(selectedFaculty);
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
