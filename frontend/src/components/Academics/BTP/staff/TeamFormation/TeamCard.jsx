import React from 'react';
import styles from '../styles/TeamCard.module.css';

export default function TeamCard({ team }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.teamName}>{team.teamName}</span>
        <span className={styles.infoIcon}>ℹ️</span>
      </div>

      <div className={styles.members}>
        {team.members.slice(0, 3).map((member, index) => (
          member ? (
            <div key={index} className={styles.member}>
              <div className={styles.avatar}></div>
              <div
                className={`${styles.statusBar} ${
                  member.isApproved ? styles.green : styles.red
                }`}
              ></div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}
