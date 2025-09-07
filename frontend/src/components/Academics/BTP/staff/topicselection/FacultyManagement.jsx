import { useState } from "react";
import FacultyList from "../../student/FA/FSlist";
import TopicCards from "./FStopiclist";
import classes from "../../../../styles/FacultySelection.module.css";
import ManualtopicAllocation from "./ManualtopicAllocation";


export const data = [
  {
    faculty: {
      name: "Dr. Anil Kumar",
      email: "anil.kumar@university.edu",
      empNumber: "EMP1001",
      topicsUploaded: 3,
    },
    topics: [
      {
        _id: "T101",
        topic: "AI in Healthcare",
        about: "Exploring AI models for disease prediction and diagnostics.",
        teams: [
          {
            teamName: "Team 1",
            members: [
              { name: "Ravi Teja", email: "ravi.teja@uni.edu", bin: 1 },
              { name: "Priya Sharma", email: "priya.sharma@uni.edu", bin: 2 },
              { name: "Karthik Reddy", email: "karthik.reddy@uni.edu", bin: 3 },
            ],
          },
          {
            teamName: "Team 2",
            members: [
              { name: "Meera Nair", email: "meera.nair@uni.edu", bin: 1 },
              { name: "Ajay Verma", email: "ajay.verma@uni.edu", bin: 2 },
              { name: "Deepak Rao", email: "deepak.rao@uni.edu", bin: 3 },
            ],
          },
          {
            teamName: "Team 3",
            members: [
              { name: "Meera Nair", email: "meera.nair@uni.edu", bin: 1 },
              { name: "Ajay Verma", email: "ajay.verma@uni.edu", bin: 2 },
              { name: "Deepak Rao", email: "deepak.rao@uni.edu", bin: 3 },
            ],
          },
          {
            teamName: "Team 4",
            members: [
              { name: "Meera Nair", email: "meera.nair@uni.edu", bin: 1 },
              { name: "Ajay Verma", email: "ajay.verma@uni.edu", bin: 2 },
              { name: "Deepak Rao", email: "deepak.rao@uni.edu", bin: 3 },
            ],
          },
          {
            teamName: "Team 5",
            members: [
              { name: "Meera Nair", email: "meera.nair@uni.edu", bin: 1 },
              { name: "Ajay Verma", email: "ajay.verma@uni.edu", bin: 2 },
              { name: "Deepak Rao", email: "deepak.rao@uni.edu", bin: 3 },
            ],
          },
        ],
      },
      {
        _id: "T102",
        topic: "Blockchain for Data Security",
        about: "Using blockchain to ensure data integrity and privacy.",
        teams: [
          {
            teamName: "Team 3",
            members: [
              { name: "Sneha Patil", email: "sneha.patil@uni.edu", bin: 1 },
              { name: "Arjun Singh", email: "arjun.singh@uni.edu", bin: 2 },
              { name: "Divya Menon", email: "divya.menon@uni.edu", bin: 3 },
            ],
          },
        ],
      },
      {
        _id: "T103",
        topic: "IoT for Smart Cities",
        about: "Implementing IoT solutions for urban infrastructure.",
        teams: [],
      },
    ],
  },
  {
    faculty: {
      name: "Prof. Neha Gupta",
      email: "neha.gupta@university.edu",
      empNumber: "EMP1002",
      topicsUploaded: 2,
    },
    topics: [
      {
        _id: "T201",
        topic: "Natural Language Processing",
        about:
          "Building NLP models for text summarization and sentiment analysis.",
        teams: [
          {
            teamName: "Team 4",
            members: [
              { name: "Vikram Das", email: "vikram.das@uni.edu", bin: 1 },
              { name: "Shreya Ghosh", email: "shreya.ghosh@uni.edu", bin: 2 },
              {
                name: "Harsha Vardhan",
                email: "harsha.vardhan@uni.edu",
                bin: 3,
              },
            ],
          },
        ],
      },
      {
        _id: "T202",
        topic: "Cybersecurity Threat Detection",
        about: "Developing AI-based threat detection models.",
        teams: [],
      },
    ],
  },
  {
    faculty: {
      name: "Dr. Rajesh Menon",
      email: "rajesh.menon@university.edu",
      empNumber: "EMP1003",
      topicsUploaded: 1,
    },
    topics: [
      {
        _id: "T301",
        topic: "Computer Vision for Autonomous Cars",
        about: "Image processing techniques for self-driving vehicles.",
        teams: [],
      },
    ],
  },
];

export const unallocatedTeams = [
  {
    teamName: "Team 1",
    members: [
      { name: "Amit Sharma", email: "amit.sharma@uni.edu", bin: 1 },
      { name: "Kiran Rao", email: "kiran.rao@uni.edu", bin: 2 },
      { name: "Neha Verma", email: "neha.verma@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 2",
    members: [
      { name: "Sunil Gupta", email: "sunil.gupta@uni.edu", bin: 1 },
      { name: "Rajeev Singh", email: "rajeev.singh@uni.edu", bin: 2 },
      { name: "Pooja Sharma", email: "pooja.sharma@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 3",
    members: [
      { name: "Anil Mehta", email: "anil.mehta@uni.edu", bin: 1 },
      { name: "Sonia Kapoor", email: "sonia.kapoor@uni.edu", bin: 2 },
      { name: "Deepak Yadav", email: "deepak.yadav@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 4",
    members: [
      { name: "Priya Das", email: "priya.das@uni.edu", bin: 1 },
      { name: "Vikram Nair", email: "vikram.nair@uni.edu", bin: 2 },
      { name: "Rohit Sinha", email: "rohit.sinha@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 5",
    members: [
      { name: "Manish Jain", email: "manish.jain@uni.edu", bin: 1 },
      { name: "Sneha Reddy", email: "sneha.reddy@uni.edu", bin: 2 },
      { name: "Harsh Vardhan", email: "harsh.vardhan@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 6",
    members: [
      { name: "Kavita Joshi", email: "kavita.joshi@uni.edu", bin: 1 },
      { name: "Arun Malhotra", email: "arun.malhotra@uni.edu", bin: 2 },
      { name: "Nisha Patel", email: "nisha.patel@uni.edu", bin: 3 },
    ],
  },

  // (sample duplicates preserved)
  {
    teamName: "Team 1",
    members: [
      { name: "Amit Sharma", email: "amit.sharma@uni.edu", bin: 1 },
      { name: "Kiran Rao", email: "kiran.rao@uni.edu", bin: 2 },
      { name: "Neha Verma", email: "neha.verma@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 2",
    members: [
      { name: "Sunil Gupta", email: "sunil.gupta@uni.edu", bin: 1 },
      { name: "Rajeev Singh", email: "rajeev.singh@uni.edu", bin: 2 },
      { name: "Pooja Sharma", email: "pooja.sharma@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 3",
    members: [
      { name: "Anil Mehta", email: "anil.mehta@uni.edu", bin: 1 },
      { name: "Sonia Kapoor", email: "sonia.kapoor@uni.edu", bin: 2 },
      { name: "Deepak Yadav", email: "deepak.yadav@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 4",
    members: [
      { name: "Priya Das", email: "priya.das@uni.edu", bin: 1 },
      { name: "Vikram Nair", email: "vikram.nair@uni.edu", bin: 2 },
      { name: "Rohit Sinha", email: "rohit.sinha@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 5",
    members: [
      { name: "Manish Jain", email: "manish.jain@uni.edu", bin: 1 },
      { name: "Sneha Reddy", email: "sneha.reddy@uni.edu", bin: 2 },
      { name: "Harsh Vardhan", email: "harsh.vardhan@uni.edu", bin: 3 },
    ],
  },
  {
    teamName: "Team 6",
    members: [
      { name: "Kavita Joshi", email: "kavita.joshi@uni.edu", bin: 1 },
      { name: "Arun Malhotra", email: "arun.malhotra@uni.edu", bin: 2 },
      { name: "Nisha Patel", email: "nisha.patel@uni.edu", bin: 3 },
    ],
  },
];

export default function FacultyManagement({dataa}) {

  const [faculties, setFaculties] = useState(data);
  const [unallocated, setUnallocated] = useState(unallocatedTeams);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedFacultyTopics, setSelectedFacultyTopics] = useState(null);
  const [showManualAllocation, setShowManualAllocation] = useState(false);


  const [teamForTopicAllocation, setTeamForTopicAllocation] = useState(null);

  const handleShowTopics = (facultyEntry) => {
    setSelectedFaculty((prev) =>
      prev?.faculty?.empNumber === facultyEntry.faculty.empNumber ? null : facultyEntry
    );
    setSelectedFacultyTopics((prev) =>
      prev === facultyEntry.topics ? null : facultyEntry.topics
    );
  };

  const handleProceedNext = () => {
    if (unallocated.length === 0) {
      setShowManualAllocation(false);
    } else {
      setShowManualAllocation(true);
    }
  };


  const handleStartAssignForTeam = (team) => {
    setTeamForTopicAllocation(team);
    setShowManualAllocation(false); 
  };


  const isSameTeam = (a, b) => {
    if (!a || !b) return false;
    if (a.teamName !== b.teamName) return false;
    const emailsA = (a.members || []).map((m) => m.email).sort();
    const emailsB = (b.members || []).map((m) => m.email).sort();
    return JSON.stringify(emailsA) === JSON.stringify(emailsB);
  };


  const handleAssignTopicToSelectedTeam = (topic) => {
    if (!teamForTopicAllocation || !selectedFaculty) return;

    const facultyId = selectedFaculty.faculty.empNumber;
    const topicId = topic._id;


    setFaculties((prev) =>
      prev.map((entry) => {
        if (entry.faculty.empNumber !== facultyId) return entry;

        const updatedTopics = entry.topics.map((t) => {
          if (t._id !== topicId) return t;


          const exists = (t.teams || []).some((team) =>
            isSameTeam(team, teamForTopicAllocation)
          );

          return {
            ...t,
            teams: exists
              ? t.teams
              : [...(t.teams || []), { ...teamForTopicAllocation }],
          };
        });

        return { ...entry, topics: updatedTopics };
      })
    );


    setUnallocated((prev) => {
      const idx = prev.findIndex((t) => isSameTeam(t, teamForTopicAllocation));
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });


    setTeamForTopicAllocation(null);

   
    if (selectedFaculty) {
      const refreshed = faculties.find(
        (f) => f.faculty.empNumber === selectedFaculty.faculty.empNumber
      );
      if (refreshed) {
        setSelectedFaculty(refreshed);
        setSelectedFacultyTopics(refreshed.topics);
      }
    }


    setShowManualAllocation((prevShow) => {
      const stillLeft =
        unallocated.filter((t) => !isSameTeam(t, teamForTopicAllocation)).length >
        0;
      return stillLeft ? true : false;
    });
  };

  return (
    <>
      {!showManualAllocation ? (
        <>
          <FacultyList faculties={faculties} onShowTopics={handleShowTopics} />

      
          {!teamForTopicAllocation && (
            <div className={classes["request-toggle-wrapper"]}>
              <button
                onClick={handleProceedNext}
                className={classes["request-toggle-btn"]}
              >
                Proceed to Next Phase
              </button>
            </div>
          )}

          {teamForTopicAllocation && (
            <div className={classes["request-toggle-wrapper"]}>
              <div className={classes["request-toggle-btn"]} style={{ cursor: "default" }}>
                Assigning topic to: {teamForTopicAllocation.teamName}
              </div>
            </div>
          )}

          {selectedFacultyTopics && (
            <TopicCards
              topics={selectedFacultyTopics}
              mode="faculty"
              selectedTeam={teamForTopicAllocation}
              onAssignTopic={handleAssignTopicToSelectedTeam}
            />
          )}
        </>
      ) : (
        <ManualtopicAllocation
          teams={unallocated}
          onAssignTopic={handleStartAssignForTeam}
        />
      )}
    </>
  );
}
