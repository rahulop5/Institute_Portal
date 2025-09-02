import React from "react";
import ReactDOM from "react-dom";
import styles from "../styles/StudentTooltip.module.css";
import idcard from "../../../../../assets/idcard.svg"
import bin from "../../../../../assets/bin.svg"

export default function StudentTooltip({ student, position }) {
  if (!student || !position) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.tooltip}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className={styles.name}>{student.name || "Full Name"}</div>
      <div className={styles.email}>{student.email || "email@domain.com"}</div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <img src={idcard} alt="Roll Icon" className={styles.icon} />
          <div>
            <div className={styles.label}>Roll Number</div>
            <div className={styles.value}>{student.rollNumber || "-"}</div>
          </div>
        </div>
        <div className={styles.detailItem}>
          <img src={bin} alt="Bin Icon" className={styles.icon} />
          <div>
            <div className={styles.label}>Bin Number</div>
            <div className={styles.value}>{student.bin ?? "-"}</div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
