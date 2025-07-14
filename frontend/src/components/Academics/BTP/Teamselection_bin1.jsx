import { useState } from 'react';
import SearchIcon from '../../../assets/search.svg';
import studentIcon from '../../../assets/studenticon.svg';
import BTPStudentList from './Studentlist';



export default function BTPTeamselection_bin1() {
  const [selectedBin, setSelectedBin] = useState(2); 
  const [selectedStudents, setSelectedStudents] = useState({});
  const [teamData, setTeamData] = useState(null);

  function handlebinchange(e) {
    const buttons = document.querySelectorAll('.team-selection-button-group button');
    buttons.forEach(button => {
      button.classList.remove('active');
    });
    e.target.classList.add('active');

    if (e.target.textContent === 'Bin 2') {
      setSelectedBin(2);
    } else if (e.target.textContent === 'Bin 3') {
      setSelectedBin(3);
    }
  }

  // 🧠 Function passed to child component
  function handleStudentSelect(student) {
    // Enforce only one student per bin
    setSelectedStudents(prev => ({
      ...prev,
      [student.bin]: student
    }));
  }

  return (
    <>
      <div className="team-selection">
        <h1>Team Formation</h1>

        <div className="team-selection-content">
          <div className="team-selection-buttons">
            <h2>Selection</h2>
            <div className="team-selection-button-group">
              <button
                className={selectedBin === 2 ? 'active' : ''}
                onClick={handlebinchange}
              >
                Bin 2
              </button>
              <button
                className={selectedBin === 3 ? 'active' : ''}
                onClick={handlebinchange}
              >
                Bin 3
              </button>
            </div>
          </div>

          <div className="search-container" id="Teamselectionsearchbar">
            <input type="text" placeholder="Search" className="search-input" />
            <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>
        </div>


       {!teamData && (
  <BTPStudentList
    bin={selectedBin}
    onSelectStudent={handleStudentSelect}
    selectedStudents={selectedStudents}
  />
)}

<button
  className={`send-request-button ${selectedStudents[2] && selectedStudents[3] ? 'active' : ''}`}
  onClick={() => {
    if (selectedStudents[2] && selectedStudents[3]) {
      // Simulated backend team response
      const dummyTeam = {
        email: selectedStudents[2].email,
        phase: "TF",
        bin: 2,
        message: "Partial Team but self approved",
        team: {
          _id: "686ea29b3c5f717e18b8e8b6",
          bin1: {
            email: "kunal.myra5@example.com",
            name: "Kunal Myra",
            approved: true
          },
          bin2: {
            email: selectedStudents[2].email,
            name: selectedStudents[2].name,
            approved: true
          },
          bin3: {
            email: selectedStudents[3].email,
            name: selectedStudents[3].name,
            approved: false
          }
        }
      };

      setTeamData(dummyTeam); // Save team to state
    } else {
      alert('One student from each bin must be selected.');
    }
  }}
>
  Send Request
</button>


{teamData ? (
  <div className="added-students">
    <h1>Your Team</h1>
    <div className="team-table">
      {["bin1", "bin2", "bin3"].map(binKey => {
        const member = teamData.team[binKey];
        return (
          <div className="team-row" key={member.email}>
            <div className="student-name-icon">
              <img src={studentIcon} alt="avatar" className="avatar-icon" />
              <span>{member.name}</span>
            </div>
            <span>{member.email}</span>
            <span className={`approval-status ${member.approved ? 'approved' : 'pending'}`}>
              {member.approved ? '✅ Approved' : '❌ Not Approved'}
            </span>
          </div>
        );
      })}
    </div>
  </div>
) : (
  <div className="added-students">
    <h1>Team</h1>
    <div className="team-table">
      {Object.entries(selectedStudents).map(([bin, student]) => (
        <div key={student.rollno} className="team-row">
          <div className="student-name-icon">
            <img src={studentIcon} alt="avatar" className="avatar-icon" />
            <span>{student.name}</span>
          </div>
          <span>{student.rollno}</span>
          <span>{student.bin}</span>
        </div>
      ))}
      {Object.keys(selectedStudents).length === 0 && (
        <div className="team-empty">No students selected.</div>
      )}
    </div>
  </div>
)}


      </div>
    </>
  );
}
