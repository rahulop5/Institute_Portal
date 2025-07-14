import { useState } from 'react';
import SearchIcon from '../../../assets/search.svg';
import studentIcon from '../../../assets/studenticon.svg';
import BTPStudentList from './Studentlist';
import TFBin1TeamSelection from './TFBin1TeamSelection';
import TFTeamthereBin1 from './TFTeamthereBin1';
// import classes from "../../styles/TeamSelectionbin1.module.css"

const temp2={
    "email": "neha.saanvi9@example.com",
    "phase": "TF",
    "inteam": 0,
    "bin": 1,
    "message": "You are currently not in any full or partial team. Form a team",
    "availablebin2": [
        {
            "name": "Kabir Neha",
            "rollno": "S20211028",
            "email": "kabir.neha28@example.com"
        },
        {
            "name": "Dev Yash",
            "rollno": "S20211036",
            "email": "dev.yash36@example.com"
        },
        {
            "name": "Saanvi Anaya",
            "rollno": "S20211037",
            "email": "saanvi.anaya37@example.com"
        }
    ],
    "availablebin3": [
        {
            "name": "Meera Ira",
            "rollno": "S20211043",
            "email": "meera.ira43@example.com"
        },
        {
            "name": "Divya Anika",
            "rollno": "S20211045",
            "email": "divya.anika45@example.com"
        },
        {
            "name": "Neha Dev",
            "rollno": "S20211046",
            "email": "neha.dev46@example.com"
        },
        {
            "name": "Anika Ira",
            "rollno": "S20211049",
            "email": "anika.ira49@example.com"
        }
    ]
}

export default function BTPTeamselection_bin1({data}) {
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
  function handleStudentSelect(student, bin) {
    // Enforce only one student per bin
    setSelectedStudents(prev => ({
      ...prev,
      [bin]: student
    }));
    console.log(selectedStudents)
  }

  function handleSendRequest(){
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
  }

  return (
    <>
      <div className="team-selection">
        {data.inteam===0?
          <TFBin1TeamSelection 
            selectedBin={selectedBin}
            handlebinchange={handlebinchange}
            SearchIcon={SearchIcon}
            handleStudentSelect={handleStudentSelect}
            selectedStudents={selectedStudents}
            handleSendRequest={handleSendRequest}
            studentIcon={studentIcon}
            data={data}
          /> : 
          <TFTeamthereBin1 
            teamData= {teamData}
            studentIcon={studentIcon}
          />
        }


      </div>
    </>
  );
}
