import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Requests.module.css';
import studentIcon from '../../../../assets/studenticon.svg'; 
function Requests({ data }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  };

  const handleAccept = (teamid) => {
    // Handle accept logic here
    console.log('Accepted:', teamid);
  };

  const handleReject = (teamid) => {
    // Handle reject logic here
    console.log('Rejected:', teamid);
  };

  const pendingRequests = data.requests.filter(req => !req.isapproved);

  return (
    <div className={styles.container}>
      {pendingRequests.map((req, index) => {
        const team = req.teamdetails;
        const topic = data.topics.find(t => t._id === req.topic);

        return (
          <div key={index} className={styles.card}>
            <div className={styles.row}>
             <div className={styles.bin1name}>
              <div className={styles.teamicon}><img src={studentIcon} alt="" /></div>
              <div className={styles.name}>{team.Bin1.name}</div>
             </div>    
              <div className={styles.topic}>{topic.topic}</div>
              <button className={styles.moreInfo} onClick={() => handleToggle(index)}>
                {expandedIndex === index ? 'Less info' : 'More info'}
              </button>
            </div>

            {expandedIndex === index && (
              <div className={styles.expanded}>
                <p><strong>Roll Number:</strong> <br />{team.Bin1.roll}</p>
                <div className={styles.teamlist}>
                   <div className={styles.team}>Team: <br /></div>
                  <div className={styles.icons}>
                    <div className={styles.icon} title={team.Bin2.name}><img src={studentIcon} alt="" /></div>
                    <div className={styles.icon} title={team.Bin3.name}><img src={studentIcon} alt="" /></div>
                  </div>
                </div>
                <div className={styles.actions}>
                  <button className={styles.reject} onClick={() => handleReject(req.teamid)}>Reject</button>
                  <button className={styles.accept} onClick={() => handleAccept(req.teamid)}>Accept</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Requests;
