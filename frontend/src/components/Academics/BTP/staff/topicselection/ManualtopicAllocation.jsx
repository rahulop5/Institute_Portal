import styles from "../styles/ManualTopicAllocation.module.css";
import studenticon from "../../../../../assets/studenticon.svg";

export default function ManualtopicAllocation({ teams, onAssignTopic }) {
  return (
    <div className={styles.manualContainer}>
      <div className={styles.mainheading}>
        <h1>Manual Topic Allocation</h1>
      </div>
      <div className={styles.mainheading}>
        <h2>Unassigned Teams</h2>
      </div>

      <div className={styles.teamsContainer}>
        {teams.map((team, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.header}>
              <span className={styles.teamName}>{team.teamName}</span>
            </div>

            <div className={styles.membersContainer}>
              <div className={styles.members}>
                {team.members.slice(0, 3).map((member, idx) =>
                  member ? (
                    <div key={idx} className={styles.member}>
                      <div className={styles.avatar}>
                        <img src={studenticon} alt="Student" />
                      </div>

                      <div className={styles.tooltip}>
                        <p>{member.name}</p>
                        <p>Bin: {member.bin}</p>
                      </div>
                    </div>
                  ) : null
                )}
              </div>

              <div className={styles.assignButtonWrapper}>
                <button
                  className={styles.assignButton}
                  onClick={() => onAssignTopic && onAssignTopic(team)}
                >
                  Assign Topic
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
