import { useState } from 'react';
import styles from '../../../styles/TabsHeader.module.css';
import SearchContainer from '../SearchContainer';

export default function TabsHeader({ activeTab, setActiveTab }) {
  return (
    <div className={styles.headerWrapper}>
      <h2 className={styles.heading}>Team Management</h2>

      <div className={styles.tabSearchRow}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tab} ${activeTab === 'topics' ? styles.active : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            Your Topics
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <SearchContainer />
        </div>
      </div>
    </div>
  );
}
