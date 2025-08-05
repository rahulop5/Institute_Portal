import React from "react";
import styles from "../../../styles/EvaluationList.module.css";
import studentIcon from '../../../../assets/studenticon.svg';
import nextpageIcon from '../../../../assets/nextpage.svg';

export default function EvaluationList({ data, tab }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.topicheading}>Topic</div>
        <div className={styles.projectidheading}>Project ID</div>
        <div className={styles.teamheading}>Team</div>
      </div>

      <div className={styles.list}>
        {data.map((item) => (
          <div
            key={item._id}
            className={`${styles.card} ${tab === "evaluating" ? styles.border : ""}`}
          >
            <div className={styles.topic}>{item.topic}</div>
            <div className={styles.teamid}>{item.projid}</div>

            <div className={styles.team}>
              {item.team.map((member, index) => (
                <div key={index} className={styles.iconWrapper}>
                  <img src={studentIcon} alt={member} />
                  <span className={styles.hoverText}>{member}</span>
                </div>
              ))}
            </div>

            {/* Render ONLY one div in the last column */}
            <div className={styles.nextPagediv}>
              <button className={styles.nextPage}><img src={nextpageIcon} alt="Next Page" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
