import React from 'react';
import styles from '../styles/TeamCard.module.css';
import info from "../../../../../assets/info.svg";
import studenticon from "../../../../../assets/studenticon.svg"

export default function TeamCard({ team }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.teamName}>{team.teamName}</span>
        <div className={styles.infobutton}>
          <button>
            <img src={info} alt="Info" />
          </button>
        </div>
      </div>

      <div className={styles.members}>
        {team.members.slice(0, 3).map((member, index) => (
          member ? (
            <div key={index} className={styles.member}>
              <div className={styles.avatar}>
                <img src={studenticon} alt="Student" />
              </div>
              <div
                className={`${styles.statusBar} ${member.isApproved ? styles.green : styles.red
                  }`}
              ></div>

              {/* Tooltip */}
              <div className={styles.tooltip}>
                <p>{member.student.name}</p>
                <p>Bin: {member.bin.id}</p>
                <p>Roll: {member.student.roll}</p>
              </div>
            </div>
          ) : null
        ))}
      </div>


    </div>
  );
}
