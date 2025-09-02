import { useState } from "react";
import styles from "../styles/PreviewModal.module.css";
import studenticon from "../../../../../assets/studenticon.svg";

export default function PreviewModal({ previewData, onClose }) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Preview</h2>
          <div>
            <button className={styles.closeButton} onClick={onClose}>
              ✖
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className={`${styles.tableSection} ${styles.scrollableList}`}>
          <table>
            <thead>
              <tr>
                <th>S.no</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Bin</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className={styles.nameCell}>
                    <img
                      src={studenticon}
                      alt="Profile"
                      className={styles.profileIcon}
                    />
                    {row.Name}
                  </td>
                  <td>{row["Roll Number"]}</td>
                  <td>{row.Bin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
            </label>
            <div>
              <p>
                I acknowledge that the upload of this file triggers{" "}
                <strong>phase shift</strong> for all users.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={isChecked ? styles.confirmButton : styles.notChecked}
            disabled={!isChecked}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
