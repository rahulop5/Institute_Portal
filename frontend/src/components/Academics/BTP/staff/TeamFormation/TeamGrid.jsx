import React from 'react';
import TeamCard from './TeamCard';
import styles from '../styles/TeamGrid.module.css';
import { data } from '../data/data';

export default function TeamGrid({ activeTab }) {
  const { teams, unallocatedMembers } = data;

  const filteredTeams =
    activeTab === 'guiding'
      ? teams.filter((team) => team.isTeamFormed)
      : activeTab === 'evaluating'
      ? teams.filter((team) => !team.isTeamFormed)
      : [];

  return (
    <div className={styles.grid}>
      {activeTab === 'requests' ? (
        <div>No team yet. Show unallocated list here.</div>
      ) : (
        filteredTeams.map((team, index) => <TeamCard key={index} team={team} />)
      )}
    </div>
  );
}
