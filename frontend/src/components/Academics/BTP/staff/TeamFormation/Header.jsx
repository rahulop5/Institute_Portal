import React, { useState } from 'react';
import styles from '../styles/Header.module.css';

export default function EvaluationList({ onTabChange }) {
  const [activeTab, setActiveTab] = useState('Formed');

  const handleClick = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  return (
    <>
   
    <div className={styles.wrapper}>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'Formed' ? styles.active : ''}`}
          onClick={() => handleClick('Formed')}
        >
          Fully formed
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Partial' ? styles.active : ''}`}
          onClick={() => handleClick('Partial')}
        >
          Partially formed
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'Unallocated' ? styles.active : ''}`}
          onClick={() => handleClick('Unallocated')}
        >
        Unallocated
        </button>
      </div>
    </div>
  
    </>
  );
}
