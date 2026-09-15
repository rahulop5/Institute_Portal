import React, { useState } from 'react';
import EvaluationListHeader from './EvaluationListHeader';
import EvaluationList from './EvaluationList';
import Overview from './Overview'; 
import styles from '../../../styles/EvaluationPage.module.css';

export default function EvaluationPage({data}) {
  const [selectedTab, setSelectedTab] = useState('guiding');

  const getCurrentData = () => {
    if (selectedTab === 'guiding') return data.guideproj;
    if (selectedTab === 'evaluating') return data.evalproj;
    return data.evalreq;
  };

  return (
    <div>
      <EvaluationListHeader onTabChange={setSelectedTab} />

      <div className={styles.contentWrapper}>
        <div className={styles.listSection}>
          <EvaluationList data={getCurrentData()} tab={selectedTab} />
        </div>

        <div className={styles.overviewSection}>
          <Overview data={data} />
        </div>
      </div>
    </div>
  );
}
