import React from "react";
import styles from "../styles/Overviewdialog.module.css";
import idcard from "../../../../../assets/idcard.svg";
import bin from "../../../../../assets/bin.svg";
import studenticon from "../../../../../assets/studenticon.svg";
import confirmed from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import ActionButtons from "./ActionButtons";

export default function TeamMemberCard({
  member,
  index,
  onDelete = { onDelete },
  onReplace = { onReplace },
  onNotify = { onNotify },
}) {
  if (!member) {
    return (
      <div className={styles.studentCard}>
        <img src={studenticon} alt="" className={styles.profileimg} />
        <div className={styles.studentName}>Add a member</div>
        <div className={styles.studentEmail}></div>

        <div className={styles.infodata}></div>

        <ActionButtons index={index} 
        onDelete={onDelete}
        onReplace={onReplace}
        onNotify={onNotify}
        />
      </div>
    );
  }

  const name = member?.student?.name ?? "—";
  const roll = member?.student?.roll ?? "—";
  const email =
    member?.student?.email ?? `${roll !== "—" ? roll : "user"}@example.com`;
  const binId = member?.bin ?? "—";
  const isApproved = !!member?.isApproved;

  return (
    <div className={styles.studentCard}>
      <img src={studenticon} alt="" className={styles.profileimg} />
      <div className={styles.studentName}>{name}</div>
      <div className={styles.studentEmail}>{email}</div>

      <div className={styles.infodata}>
        <div className={styles.rollNumber}>
          <div className={styles.rollNumberImg}>
            <img src={idcard} alt="ID card" />
          </div>
          <div className={styles.rollNumberDetailsDiv}>
            <div className={styles.label}>Roll Number</div>
            <div className={styles.rollNumberValue}>{roll}</div>
          </div>
        </div>

        <div className={styles.binLabel}>
          <div className={styles.binLabelImg}>
            <img src={bin} alt="Bin Icon" />
          </div>
          <div className={styles.binLabelDetailsDiv}>
            <div className={styles.label}>Bin Number</div>
            <div className={styles.binNumberValue}>{binId}</div>
          </div>
        </div>

        <div className={styles.status}>
          <div>Status:</div>
          <div className={styles.statusWrapper}>
            <div className={styles.statusIconWrapper}>
              <img
                src={isApproved ? confirmed : pending}
                alt={isApproved ? "Confirmed" : "Pending"}
                className={styles.statusIcon}
              />
            </div>
            <div
              className={
                isApproved ? styles.statusConfirmed : styles.statusPending
              }
            >
              {isApproved ? "Confirmed" : "Pending..."}
            </div>
          </div>
        </div>
      </div>

      <ActionButtons
        index={index}
        isApproved={member.isApproved}
        onDelete={onDelete}
        onReplace={onReplace}
        onNotify={onNotify}
      />
    </div>
  );
}
