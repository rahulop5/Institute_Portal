import React, { useState } from 'react';
import styles from '../../../styles/Requests.module.css';
import studentIcon from '../../../../assets/studenticon.svg';

function Requests({ data }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const handleAccept = (teamid) => {
    console.log('Accepted:', teamid);
    // TODO: call backend API here
  };

  const handleReject = (teamid) => {
    console.log('Rejected:', teamid);
    // TODO: call backend API here
  };

  // Use only unapproved requests
  const pendingRequests = data.topics.requests.filter(req => !req.isapproved);

  return (
    <div className={styles.container}>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        pendingRequests.map((req, index) => {
          const team = req.teamid;
          const topic = req.topicDetails;

          return (
            <div key={index} className={styles.card}>
              <div className={styles.row}>
                <div className={styles.bin1name}>
                  <div className={styles.teamicon}>
                    <img src={studentIcon} alt="student" />
                  </div>
                  <div className={styles.name}>{team.bin1.student.name}</div>
                </div>
                <div className={styles.topic}>{topic.topic}</div>
                <button className={styles.moreInfo} onClick={() => handleToggle(index)}>
                  {expandedIndex === index ? 'Less info' : 'More info'}
                </button>
              </div>

              {expandedIndex === index && (
                <div className={styles.expanded}>
                  <p>
                    <strong>Roll Number:</strong> <br />
                    {team.bin1.student.rollno}
                  </p>
                  <div className={styles.teamlist}>
                    <div className={styles.team}>Team: <br /></div>
                    <div className={styles.icons}>
                      <div className={styles.icon} title={team.bin2.student.name}>
                        <img src={studentIcon} alt="student" />
                      </div>
                      <div className={styles.icon} title={team.bin3.student.name}>
                        <img src={studentIcon} alt="student" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.reject} onClick={() => handleReject(team._id)}>
                      Reject
                    </button>
                    <button className={styles.accept} onClick={() => handleAccept(team._id)}>
                      Accept
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Requests;
