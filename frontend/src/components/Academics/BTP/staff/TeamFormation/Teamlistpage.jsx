import React, { useState, useEffect } from "react";
import Header from "./Header";
import TeamCard from "./TeamCard";
import UnallocatedStudents from "./UnallocatedStudents";
import styles from "../styles/TeamListPage.module.css";

export const initialTeamsData = {
  teams: [
    {
      teamName: "Team 1",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Abhiram Reddi", roll: "S20230012003" },
          bin: { id: 1 },
          isApproved: true,
          email: "abhiram.reddi@example.com",
        },
        {
          student: { name: "Sahal Ansar", roll: "S20230012010" },
          bin: { id: 2 },
          isApproved: true,
          email: "sahal.ansar@example.com",
        },
        {
          student: { name: "Sai Tej", roll: "S20230012001" },
          bin: { id: 3 },
          isApproved: true,
          email: "sai.tej@example.com",
        },
      ],
    },
    {
      teamName: "Team 2",
      isTeamFormed: false,
      members: [
        {
          student: { name: "Venkat Rahul", roll: "S20230012057" },
          bin: { id: 1 },
          isApproved: true,
          email: "venkat.rahul@example.com",
        },
        {
          student: { name: "Harini V", roll: "S20230012112" },
          bin: { id: 2 },
          isApproved: false,
          email: "harini.v@example.com",
        },
        {
          student: { name: "Rohit Kumar", roll: "S20230012145" },
          bin: { id: 3 },
          isApproved: false,
          email: "rohit.kumar@example.com",
        },
      ],
    },
    {
      teamName: "Team 3",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Meera Sharma", roll: "S20230012022" },
          bin: { id: 1 },
          isApproved: true,
          email: "meera.sharma@example.com",
        },
        {
          student: { name: "Aditya Verma", roll: "S20230012023" },
          bin: { id: 2 },
          isApproved: true,
          email: "aditya.verma@example.com",
        },
        {
          student: { name: "Nikhil Singh", roll: "S20230012024" },
          bin: { id: 3 },
          isApproved: true,
          email: "nikhil.singh@example.com",
        },
      ],
    },
    {
      teamName: "Team 4",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Ananya Gupta", roll: "S20230012030" },
          bin: { id: 1 },
          isApproved: true,
          email: "ananya.gupta@example.com",
        },
        {
          student: { name: "Yash Patel", roll: "S20230012031" },
          bin: { id: 2 },
          isApproved: true,
          email: "yash.patel@example.com",
        },
        {
          student: { name: "Riya Chakraborty", roll: "S20230012032" },
          bin: { id: 3 },
          isApproved: true,
          email: "riya.chakraborty@example.com",
        },
      ],
    },
    {
      teamName: "Team 5",
      isTeamFormed: false,
      members: [
        {
          student: { name: "Karthik R", roll: "S20230012040" },
          bin: { id: 1 },
          isApproved: true,
          email: "karthik.r@example.com",
        },
        {
          student: { name: "Pooja N", roll: "S20230012041" },
          bin: { id: 2 },
          isApproved: true,
          email: "pooja.n@example.com",
        },
        {
          student: { name: "Zoya Ali", roll: "S20230012042" },
          bin: { id: 3 },
          isApproved: false,
          email: "zoya.ali@example.com",
        },
      ],
    },
    {
      teamName: "Team 6",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Devika Sharma", roll: "S20230012050" },
          bin: { id: 1 },
          isApproved: true,
          email: "devika.sharma@example.com",
        },
        {
          student: { name: "Rahul Nair", roll: "S20230012051" },
          bin: { id: 2 },
          isApproved: true,
          email: "rahul.nair@example.com",
        },
        {
          student: { name: "Krishna Rao", roll: "S20230012052" },
          bin: { id: 3 },
          isApproved: true,
          email: "krishna.rao@example.com",
        },
      ],
    },
    {
      teamName: "Team 7",
      isTeamFormed: false,
      members: [
        {
          student: { name: "Isha Kapoor", roll: "S20230012060" },
          bin: { id: 1 },
          isApproved: true,
          email: "isha.kapoor@example.com",
        },
        {
          student: { name: "Mohit Sharma", roll: "S20230012061" },
          bin: { id: 2 },
          isApproved: false,
          email: "mohit.sharma@example.com",
        },
        {
          student: { name: "Priya Jain", roll: "S20230012062" },
          bin: { id: 3 },
          isApproved: false,
          email: "priya.jain@example.com",
        },
      ],
    },
    {
      teamName: "Team 8",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Ramesh B", roll: "S20230012070" },
          bin: { id: 1 },
          isApproved: true,
          email: "ramesh.b@example.com",
        },
        {
          student: { name: "Neha Mehta", roll: "S20230012071" },
          bin: { id: 2 },
          isApproved: true,
          email: "neha.mehta@example.com",
        },
        {
          student: { name: "Arjun Das", roll: "S20230012072" },
          bin: { id: 3 },
          isApproved: true,
          email: "arjun.das@example.com",
        },
      ],
    },
    {
      teamName: "Team 9",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Shreya S", roll: "S20230012080" },
          bin: { id: 1 },
          isApproved: true,
          email: "shreya.s@example.com",
        },
        {
          student: { name: "Vikram Singh", roll: "S20230012081" },
          bin: { id: 2 },
          isApproved: true,
          email: "vikram.singh@example.com",
        },
        {
          student: { name: "Deepak Yadav", roll: "S20230012082" },
          bin: { id: 3 },
          isApproved: true,
          email: "deepak.yadav@example.com",
        },
      ],
    },
    {
      teamName: "Team 10",
      isTeamFormed: false,
      members: [
        {
          student: { name: "Komal S", roll: "S20230012090" },
          bin: { id: 1 },
          isApproved: true,
          email: "komal.s@example.com",
        },
        {
          student: { name: "Pranav D", roll: "S20230012091" },
          bin: { id: 2 },
          isApproved: false,
          email: "pranav.d@example.com",
        },
        {
          student: { name: "Farhan K", roll: "S20230012092" },
          bin: { id: 3 },
          isApproved: false,
          email: "farhan.k@example.com",
        },
      ],
    },
    {
      teamName: "Team 11",
      isTeamFormed: true,
      members: [
        {
          student: { name: "Tanvi S", roll: "S20230012100" },
          bin: { id: 1 },
          isApproved: true,
          email: "tanvi.s@example.com",
        },
        {
          student: { name: "Arnav P", roll: "S20230012101" },
          bin: { id: 2 },
          isApproved: true,
          email: "arnav.p@example.com",
        },
        {
          student: { name: "Ritika B", roll: "S20230012102" },
          bin: { id: 3 },
          isApproved: true,
          email: "ritika.b@example.com",
        },
      ],
    },
    {
      teamName: "Team 12",
      isTeamFormed: false,
      members: [
        {
          student: { name: "Siddharth V", roll: "S20230012110" },
          bin: { id: 1 },
          isApproved: true,
          email: "siddharth.v@example.com",
        },
        {
          student: { name: "Sneha K", roll: "S20230012111" },
          bin: { id: 2 },
          isApproved: false,
          email: "sneha.k@example.com",
        },
        {
          student: { name: "Akshay R", roll: "S20230012112" },
          bin: { id: 3 },
          isApproved: false,
          email: "akshay.r@example.com",
        },
      ],
    },
  ],
  unallocatedMembers: [
    { student: { name: "Harshita P", roll: "S20230012120" }, bin: { id: 1 }, email: "harshita.p@example.com" },
    { student: { name: "Sanjana R", roll: "S20230012121" }, bin: { id: 2 }, email: "sanjana.r@example.com" },
    { student: { name: "Abdul Rahman", roll: "S20230012122" }, bin: { id: 3 }, email: "abdul.rahman@example.com" },
    { student: { name: "Karthika S", roll: "S20230012123" }, bin: { id: 1 }, email: "karthika.s@example.com" },
    { student: { name: "Gaurav D", roll: "S20230012124" }, bin: { id: 2 }, email: "gaurav.d@example.com" },
    { student: { name: "Roshni L", roll: "S20230012125" }, bin: { id: 3 }, email: "roshni.l@example.com" },
  ],
};

export default function TeamListPage({data}) {
  const [teamsData, setTeamsData] = useState(data.response);
  const [activeTab, setActiveTab] = useState("Formed");

  useEffect(() => {
    setTeamsData(data.response);  // refresh when loader data changes
  }, [data]);

  const handleTabChange = (tab) => setActiveTab(tab);

  const fullyFormedTeams = teamsData.fullyFormedTeams;
  const partiallyFormedTeams = teamsData.partiallyFormedTeams;


  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Team Formation</h1>
      <Header onTabChange={handleTabChange} />

      <div
        className={
          activeTab === "Unallocated" ? styles.unallocatedContainer : styles.gridContainer
        }
      >
        {activeTab === "Formed" &&
          fullyFormedTeams.map((team, index) => (
            <TeamCard
              key={index}
              team={team}
              teamsData={teamsData}
              setTeamsData={setTeamsData} 
            />
          ))}

        {activeTab === "Partial" &&
          partiallyFormedTeams.map((team, index) => (
            <TeamCard
              key={index}
              team={team}
              teamsData={teamsData}
              setTeamsData={setTeamsData}
            />
          ))}

        {activeTab === "Unallocated" && (
          <UnallocatedStudents
            unallocatedData={teamsData.unallocatedMembers}
            setTeamsData={setTeamsData}
            isSelectMode={false}
          />
        )}
      </div>
    </div>
  );
}