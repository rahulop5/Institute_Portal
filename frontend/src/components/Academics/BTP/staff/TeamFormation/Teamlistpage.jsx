import React, { useState } from 'react';
import Header from './Header';
import TeamCard from './TeamCard';
import UnallocatedStudents from './UnallocatedStudents';
import styles from '../styles/TeamListPage.module.css';

export const teamsData = {
  teams: [
    {
      teamName: "Team 1",
      isTeamFormed: true,
      members: [
        { student: { name: "Abhiram Reddi", roll: "S20230012003" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Sahal Ansar", roll: "S20230012010" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Sai Tej", roll: "S20230012001" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 2",
      isTeamFormed: false,
      members: [
        { student: { name: "Venkat Rahul", roll: "S20230012057" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Harini V", roll: "S20230012112" }, bin: { id: 2 }, isApproved: false },
        { student: { name: "Rohit Kumar", roll: "S20230012145" }, bin: { id: 3 }, isApproved: false },
      ],
    },
    {
      teamName: "Team 3",
      isTeamFormed: true,
      members: [
        { student: { name: "Meera Sharma", roll: "S20230012022" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Aditya Verma", roll: "S20230012023" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Nikhil Singh", roll: "S20230012024" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 4",
      isTeamFormed: true,
      members: [
        { student: { name: "Ananya Gupta", roll: "S20230012030" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Yash Patel", roll: "S20230012031" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Riya Chakraborty", roll: "S20230012032" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 5",
      isTeamFormed: false,
      members: [
        { student: { name: "Karthik R", roll: "S20230012040" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Pooja N", roll: "S20230012041" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Zoya Ali", roll: "S20230012042" }, bin: { id: 3 }, isApproved: false },
      ],
    },
    {
      teamName: "Team 6",
      isTeamFormed: true,
      members: [
        { student: { name: "Devika Sharma", roll: "S20230012050" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Rahul Nair", roll: "S20230012051" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Krishna Rao", roll: "S20230012052" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 7",
      isTeamFormed: false,
      members: [
        { student: { name: "Isha Kapoor", roll: "S20230012060" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Mohit Sharma", roll: "S20230012061" }, bin: { id: 2 }, isApproved: false },
        { student: { name: "Priya Jain", roll: "S20230012062" }, bin: { id: 3 }, isApproved: false },
      ],
    },
    {
      teamName: "Team 8",
      isTeamFormed: true,
      members: [
        { student: { name: "Ramesh B", roll: "S20230012070" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Neha Mehta", roll: "S20230012071" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Arjun Das", roll: "S20230012072" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 9",
      isTeamFormed: true,
      members: [
        { student: { name: "Shreya S", roll: "S20230012080" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Vikram Singh", roll: "S20230012081" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Deepak Yadav", roll: "S20230012082" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 10",
      isTeamFormed: false,
      members: [
        { student: { name: "Komal S", roll: "S20230012090" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Pranav D", roll: "S20230012091" }, bin: { id: 2 }, isApproved: false },
        { student: { name: "Farhan K", roll: "S20230012092" }, bin: { id: 3 }, isApproved: false },
      ],
    },
    {
      teamName: "Team 11",
      isTeamFormed: true,
      members: [
        { student: { name: "Tanvi S", roll: "S20230012100" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Arnav P", roll: "S20230012101" }, bin: { id: 2 }, isApproved: true },
        { student: { name: "Ritika B", roll: "S20230012102" }, bin: { id: 3 }, isApproved: true },
      ],
    },
    {
      teamName: "Team 12",
      isTeamFormed: false,
      members: [
        { student: { name: "Siddharth V", roll: "S20230012110" }, bin: { id: 1 }, isApproved: true },
        { student: { name: "Sneha K", roll: "S20230012111" }, bin: { id: 2 }, isApproved: false },
        { student: { name: "Akshay R", roll: "S20230012112" }, bin: { id: 3 }, isApproved: false },
      ],
    },
  ],
  unallocatedMembers: [
    { student: { name: "Harshita P", roll: "S20230012120" }, bin: { id: 1 } },
    { student: { name: "Sanjana R", roll: "S20230012121" }, bin: { id: 2 } },
    { student: { name: "Abdul Rahman", roll: "S20230012122" }, bin: { id: 3 } },
    { student: { name: "Karthika S", roll: "S20230012123" }, bin: { id: 1 } },
    { student: { name: "Gaurav D", roll: "S20230012124" }, bin: { id: 2 } },
    { student: { name: "Roshni L", roll: "S20230012125" }, bin: { id: 3 } },
  ],
};

export default function TeamListPage() {
  // ✅ keep your data and tabs; make them stateful so replacement can update the UI
  const [teams, setTeams] = useState(teamsData.teams);
  const [unallocatedMembers, setUnallocatedMembers] = useState(teamsData.unallocatedMembers);
  const [activeTab, setActiveTab] = useState('Formed');

  const handleTabChange = (tab) => setActiveTab(tab);

  // ✅ main replacement handler (order: newStudent, oldMember, memberIndex, teamName)
  const handleReplaceStudent = (newStudent, oldMember, memberIndex, teamName) => {
    // Update the right team & member (preserve isApproved from old member)
    setTeams(prev =>
      prev.map(team => {
        if (team.teamName !== teamName) return team;
        const updatedMembers = team.members.map((m, i) =>
          i === memberIndex
            ? { ...oldMember, student: newStudent.student, bin: newStudent.bin }
            : m
        );
        return { ...team, members: updatedMembers };
      })
    );

    // Remove newStudent from unallocated; add oldMember back to unallocated
    setUnallocatedMembers(prev => {
      const filtered = prev.filter(u => u.student.roll !== newStudent.student.roll);
      // Unallocated shape does not need isApproved; just student + bin
      return [...filtered, { student: oldMember.student, bin: oldMember.bin }];
    });
  };

  const fullyFormedTeams = teams.filter((team) => team.isTeamFormed);
  const partiallyFormedTeams = teams.filter((team) => !team.isTeamFormed);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Team Formation</h1>
      <Header onTabChange={handleTabChange} />

      <div className={activeTab === "Unallocated" ? styles.unallocatedContainer : styles.gridContainer}>
        {activeTab === "Formed" &&
          fullyFormedTeams.map((team, index) => (
            <TeamCard
              key={index}
              team={team}
              unallocatedData={unallocatedMembers}
              onConfirmReplace={handleReplaceStudent}
            />
          ))}

        {activeTab === "Partial" &&
          partiallyFormedTeams.map((team, index) => (
            <TeamCard
              key={index}
              team={team}
              unallocatedData={unallocatedMembers}
              onConfirmReplace={handleReplaceStudent}
            />
          ))}

        {activeTab === "Unallocated" && (
          <UnallocatedStudents unallocatedData={unallocatedMembers} />
        )}
      </div>
    </div>
  );
}
