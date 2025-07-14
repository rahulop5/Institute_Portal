import { useState } from 'react';
import studentIcon from '../../../assets/studenticon.svg';

// Dummy incoming request data (replace with actual backend data later)
const incomingRequests = [
  {
    email: 'yash.priya24@example.com',
    phase: 'TF',
    bin: 2,
    message: 'Partial Team but self approved',
    team: {
      _id: '686ea29b3c5f717e18b8e8b6',
      bin1: {
        email: 'kunal.myra5@example.com',
        name: 'Kunal Myra',
        rollno: 'S20211005',
        section: '1',
        bin: 1,
        approved: true
      },
      bin2: {
        email: 'yash.priya24@example.com',
        name: 'Yash Priya',
        rollno: 'S20211024',
        section: '2',
        bin: 2,
        approved: false
      },
      bin3: {
        email: 'meera.ira43@example.com',
        name: 'Meera Ira',
        rollno: 'S20211043',
        section: '3',
        bin: 3,
        approved: false
      }
    }
  },
  {
    email: 'diya.sai38@example.com',
    phase: 'TF',
    bin: 2,
    message: 'Partial Team but self approved',
    team: {
      _id: 'd1a1team',
      bin1: {
        email: 'vivaan.sneha21@example.com',
        name: 'Vivaan Sneha',
        rollno: 'S20211021',
        section: '1',
        bin: 1,
        approved: true
      },
      bin2: {
        email: 'diya.sai38@example.com',
        name: 'Diya Sai',
        rollno: 'S20211038',
        section: '1',
        bin: 2,
        approved: false
      },
      bin3: {
        email: 'anika.ira49@example.com',
        name: 'Anika Ira',
        rollno: 'S20211049',
        section: '2',
        bin: 3,
        approved: false
      }
    }
  }
];

export default function BTPTeamselection_bin23() {
  const [approvedTeam, setApprovedTeam] = useState(null);

  const handleAccept = (team) => {
    setApprovedTeam(team);
  };

  return (
    <div className="team-selection">
      <h1>Team Formation</h1>
      <div className="team-selection-content">
        <div className="team-selection-header">
          <h2>Incoming Requests</h2>
          <div className="warning-message">
            <p>Only <strong>ONE</strong> team leader can be accepted and it is final.</p>
          </div>
        </div>

        {!approvedTeam ? (
          <div className="incoming-requests">
            {incomingRequests.map((request, index) => (
<div key={index} className="request-card">
  <div className="request-info">
    <img src={studentIcon} alt="avatar" />
    <div className="request-details">
      <strong>{request.team.bin1.name}</strong>
      <span>{request.team.bin1.email}</span>
    </div>
  </div>
  <div className="action-buttons">
    <button className="reject-button">Reject</button>
    <button className="accept-button" onClick={() => handleAccept(request.team)}>Accept</button>
  </div>
</div>

            ))}
          </div>
        ) : (
          <div className="added-students">
            <h2>Your Team</h2>
            <div className="team-table">
              {[approvedTeam.bin1, approvedTeam.bin2, approvedTeam.bin3].map((member, idx) => (
                <div key={idx} className="team-row">
                  <div className="student-name-icon">
                    <img src={studentIcon} alt="avatar" className="avatar-icon" />
                    <span>{member.name}</span>
                  </div>
                  <span>{member.rollno}</span>
                  <span>{member.section}</span>
                  <span>{member.bin}</span>
                  <span className={`status ${member.approved ? 'approved' : 'pending'}`}>
                    {member.approved ? '✔ Confirmed' : '⌛ Pending...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
