import { useState } from "react";
import TopicCards from "./FStopiclist";
import classes from "../../../../styles/FacultySelection.module.css";
import ManualtopicAllocation from "./ManualtopicAllocation";
import { useSubmit, redirect } from "react-router";
import TabsHeader from "./TabsHeader";
import FacultyList from "./FSlist";

//dummy data
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

const normalizeData = (dataa) => {
  // Faculties + topics
  const faculties = dataa.topics.map((t) => ({
    faculty: {
      name: t.faculty.name,
      email: t.faculty.email,
      empNumber: t.faculty._id, // use _id instead of empNumber
      topicsUploaded: t.topics.length,
    },
    topics: t.topics.map((topic) => {
      // collect requests → teams
      const teams = (t.requests || [])
        .filter((r) => r.topic === topic._id && r.isapproved) // only approved requests
        .map((r) => {
          const team = r.teamid;
          return {
            teamName: team._id, // use teamid _id as identifier
            members: ["bin1", "bin2", "bin3"]
              .map((bin) =>
                team[bin]?.student
                  ? {
                      name: team[bin].student.name,
                      email: team[bin].student.email,
                      bin: team[bin].student.bin,
                    }
                  : null
              )
              .filter(Boolean),
          };
        });

      return {
        _id: topic._id,
        topic: topic.topic,
        about: topic.about,
        teams,
      };
    }),
  }));

  // Unallocated teams
  const unallocated = (dataa.unassignedTeams || []).map((team) => ({
    teamName: team._id,
    members: ["bin1", "bin2", "bin3"]
      .map((bin) =>
        team[bin]?.student
          ? {
              name: team[bin].student.name,
              email: team[bin].student.email,
              bin: team[bin].student.bin,
            }
          : null
      )
      .filter(Boolean),
  }));

  return { faculties, unallocated };
};

export default function FacultyManagement({ dataa }) {
  const { faculties: initialFaculties, unallocated: initialUnallocated } =
    normalizeData(dataa);

  const [faculties, setFaculties] = useState(initialFaculties);
  const [unallocated, setUnallocated] = useState(initialUnallocated);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedFacultyTopics, setSelectedFacultyTopics] = useState(null);
  const [showManualAllocation, setShowManualAllocation] = useState(false);
  const [teamForTopicAllocation, setTeamForTopicAllocation] = useState(null);
  const [activeTab, setActiveTab] = useState("facultyTopics");
  const submit = useSubmit();

  const handleShowTopics = (facultyEntry) => {
    setSelectedFaculty((prev) =>
      prev?.faculty?.empNumber === facultyEntry.faculty.empNumber
        ? null
        : facultyEntry
    );
    setSelectedFacultyTopics((prev) =>
      prev === facultyEntry.topics ? null : facultyEntry.topics
    );
  };

  const handleNextPreference = () => {
    const formData = new FormData();
    formData.append("phase", dataa.phase); // optional, include if backend needs it

    submit(formData, {
      method: "post",
      action: "advancepreferencernd", // backend route
    });
  };

  const handleStartAssignForTeam = (team) => {
    setTeamForTopicAllocation(team);
    setActiveTab("facultyTopics"); // switch to topics tab to assign
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

  const formData = new FormData();

  // Fix 1: use teamName instead of _id (or set _id properly in normalizeData)
  formData.append("teamid", teamForTopicAllocation.teamName);

  // Fix 2: use empNumber instead of _id
  formData.append("facultyId", selectedFaculty.faculty.empNumber);

  formData.append("topicid", topic._id);

  submit(formData, {
    method: "post",
    action: "assignGuide",
  });

  setTeamForTopicAllocation(null);
  setShowManualAllocation(false);
};



  return (
    <div>
      <TabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "facultyTopics" && (
        <>
          <FacultyList faculties={faculties} onShowTopics={handleShowTopics} />
          <div className={classes["request-toggle-wrapper"]}>
            <button
              className={classes["request-toggle-btn"]}
              onClick={handleNextPreference}
            >
              {dataa.currentPreferenceRound === 4
                ? "Proceed to Next Phase"
                : "Proceed to Next Preference"}
            </button>
          </div>

          {teamForTopicAllocation && (
            <div className={classes["request-toggle-wrapper"]}>
              <div
                className={classes["request-toggle-btn"]}
                style={{ cursor: "default" }}
              >
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
      )}

      {activeTab === "unassignedTeams" && (
        <ManualtopicAllocation
          teams={unallocated}
          onAssignTopic={handleStartAssignForTeam}
        />
      )}
    </div>
  );
}

export async function advancePreferenceAction({ request }) {
  const formData = await request.formData();
  const reqDataJSON = formData.get("reqData");
  // const { phase } = JSON.parse(reqDataJSON);

  // if (!phase) {
  //   throw new Response(
  //     JSON.stringify({ message: "Phase is required" }),
  //     { status: 400 }
  //   );
  // }

  const token = localStorage.getItem("token");
  const batch = "2022"; // hardcoded like your deleteTeamAction

  const response = await fetch(
    `http://localhost:3000/staff/btp/advancepreferencernd?batch=${batch}`,
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ phase }), // backend expects { phase } (adjust if different)
    }
  );

  if (!response.ok) {
    const result = await response.json();
    console.error("Backend error:", result);
    throw new Response(
      JSON.stringify({
        message: result.message || "Error advancing preference round",
      }),
      { status: response.status }
    );
  }

  const result = await response.json();
  console.log("Preference advanced:", result);

  return redirect("/academics/btp/staff");
}

export async function assignGuideAction({ request }) {
  const formData = await request.formData();
  const teamid = formData.get("teamid");
  const facultyId = formData.get("facultyId");
  const topicid = formData.get("topicid");

  if (!teamid || !facultyId || !topicid) {
    throw new Response(
      JSON.stringify({ message: "Missing required fields" }),
      { status: 400 }
    );
  }

  const token = localStorage.getItem("token");
  // const batch = "2022"; // adjust if dynamic

  const response = await fetch(
    `http://localhost:3000/staff/btp/allocatefaculty`,
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ teamid, facultyId, topicid }),
    }
  );

  if (!response.ok) {
    const result = await response.json();
    console.log(result)
    throw new Response(
      JSON.stringify({
        message: result.message || "Error assigning guide",
      }),
      { status: response.status }
    );
  }

  const result = await response.json();
  console.log("Guide assigned:", result);

  return redirect("/academics/btp/staff");
}

