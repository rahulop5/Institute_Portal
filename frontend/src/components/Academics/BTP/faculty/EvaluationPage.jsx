import React, { useState } from 'react';
import EvaluationListHeader from './EvaluationListHeader';
import EvaluationList from './EvaluationList';
import Overview from './Overview'; 
import styles from '../../../styles/EvaluationPage.module.css';

export default function EvaluationPage({data}) {
  const [selectedTab, setSelectedTab] = useState('guiding');

  const data2 = {
    email: 'asha.iyer@example.com',
    guideproj: [
      {
        _id: '1',
        topic: 'Assistive Technologies for Accessibility',
        projid: 'T1000202',
        team: ['Pavan Karthik Soothradar', 'Abhiram', 'Sa Tej'],
        status: 'pending',
      },
    ],
    evalproj: [
      {
        _id: '2',
        topic: 'Remote Monitoring and Control Systems',
        projid: 'T1000784',
        team: ['Pavan Karthik Soothradar', 'Abhiram', 'Sa Tej'],
        status: 'rejected',
      },
    ],
    evalreq: [
      {
        _id: '3',
        topic: 'Next-Gen Communication Platforms',
        projid: 'T1000312',
        team: ['Pavan Karthik Soothradar', 'Abhiram', 'Sa Tej'],
        status: 'approved',
        deadline: '2023-12-31',
      },
      {
        _id: '4',
        topic: 'Low-Cost Tech for Grassroots Impact',
        projid: 'T1000640',
        team: ['Pavan Karthik Soothradar', 'Abhiram', 'Sa Tej'],
        status: 'approved',
      },
    ],
  };

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
