import React from 'react';
import styles from '../../../styles/Overview.module.css';
import totalprojects from '../../../../assets/totalprojs.svg';
import guidingIcon from '../../../../assets/totalgudiing.svg';
import evaluatingIcon from '../../../../assets/totalevaluating.svg';

export default function Overview({ data }) {
  const totalProjects     = data.guideproj.length + data.evalproj.length;
  const guidingCount      = data.guideproj.length;
  const evaluatingCount   = data.evalproj.length;
  const requestCount      = data.evalreq.length;

  return (
    <div className={styles.overviewContainer}>
      {/* Total Projects */}
      <div className={styles.item}>
        <img src={totalprojects} alt="Total Projects" className={styles.icon} />
        <span className={styles.number}>{totalProjects}</span>
      </div>

      {/* Guiding */}
      <div className={styles.item}>
        <img src={guidingIcon} alt="Guiding" className={styles.icon} />
        <span className={`${styles.number} ${styles.guiding}`}>{guidingCount}</span>
      </div>

      {/* Evaluating */}
      <div className={styles.item}>
        <img src={evaluatingIcon} alt="Evaluating" className={styles.icon} />
        <span className={`${styles.number} ${styles.evaluating}`}>{evaluatingCount}</span>
      </div>

      {/* Requests */}
      <div className={`${styles.item} ${styles.lastItem}`}>
        <span className={`${styles.number} ${styles.requests}`}>{requestCount}</span>
        <span className={`${styles.icon}`}>EE</span>
      </div>
    </div>
  );
}
