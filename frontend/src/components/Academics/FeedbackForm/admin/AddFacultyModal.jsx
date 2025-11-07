import { useState } from "react";
import styles from "../styles/addFacultyModal.module.css";

export default function AddFacultyModal({ onClose, onConfirm }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");

  const handleConfirm = () => {
    const newFaculty = { name, email, department };

   
    if (onConfirm) onConfirm(newFaculty);

   
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Add faculty</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Name:</label>
          <input
            type="text"
            placeholder="Type here..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            placeholder="Type here..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Department:</label>
          <div className={styles.deptBtns}>
            {["CSE", "ECE", "MDS"].map((dept) => (
              <button
                key={dept}
                className={`${styles.deptBtn} ${
                  department === dept ? styles.activeDept : ""
                }`}
                onClick={() => setDepartment(dept)}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <button className={styles.confirmBtn} onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}
