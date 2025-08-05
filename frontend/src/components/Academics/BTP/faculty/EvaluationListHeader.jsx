import React, { useState } from 'react';
import styles from '../../../styles/EvaluationListHeader.module.css';

export default function EvaluationList({ onTabChange }) {
  const [activeTab, setActiveTab] = useState('guiding');

  const handleClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <>
   
    <div className={styles.wrapper}>
    <h1>BTP</h1>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'guiding' ? styles.active : ''}`}
          onClick={() => handleClick('guiding')}
        >
          Projects guiding
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'evaluating' ? styles.active : ''}`}
          onClick={() => handleClick('evaluating')}
        >
          Projects evaluating
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
          onClick={() => handleClick('requests')}
        >
          Evaluation requests
        </button>
      </div>
    </div>
  
    </>
  );
}


