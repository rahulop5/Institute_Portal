import React from "react";
import styles from "../styles/Overviewdialog.module.css";
import idcard from "../../../../../assets/idcard.svg";
import bin from "../../../../../assets/bin.svg";
import studenticon from "../../../../../assets/studenticon.svg";
import confirmed from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import ActionButtons from "./ActionButtons";

export default function TeamMemberCard({ member, index, onReplace }) {
  return (
    <div className={styles.studentCard}>
      <img src={studenticon} alt="" className={styles.profileimg} />
      <div className={styles.studentName}>{member.student.name}</div>
      <div className={styles.studentEmail}>{member.student.email}</div>

      <div className={styles.infodata}>
        <div className={styles.rollNumber}>
          <div className={styles.rollNumberImg}><img src={idcard} alt="ID card" /></div>
          <div className={styles.rollNumberDetailsDiv}>
            <div className={styles.label}>Roll Number</div>
            <div className={styles.rollNumberValue}>{member.student.roll}</div>
          </div>
        </div>

        <div className={styles.binLabel}>
          <div className={styles.binLabelImg}><img src={bin} alt="Bin Icon" /></div>
          <div className={styles.binLabelDetailsDiv}>
            <div className={styles.label}>Bin Number</div>
            <div className={styles.binNumberValue}>{member.bin.id}</div>
          </div>
        </div>

        <div className={styles.status}>
          <div>Status:</div>
          <div className={styles.statusWrapper}>
            <div className={styles.statusIconWrapper}>
              <img
                src={member.isApproved ? confirmed : pending}
                alt={member.isApproved ? "Confirmed" : "Pending"}
                className={styles.statusIcon}
              />
            </div>
            <div className={member.isApproved ? styles.statusConfirmed : styles.statusPending}>
              {member.isApproved ? "Confirmed" : "Pending..."}
            </div>
          </div>
        </div>
      </div>

      <ActionButtons index={index} onReplace={onReplace} />
    </div>
  );
}
