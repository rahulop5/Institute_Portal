export default function TFTeamthereBin1({teamData, studentIcon}){
    return <>
        <div className="added-students">
          <h1>Your Team</h1>
          <div className="team-table">
            {["bin1", "bin2", "bin3"].map((binKey) => {
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
    </>;
}