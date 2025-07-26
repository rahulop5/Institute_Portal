export default function TeamCard({ team }) {
  return (
    <div className="team-card">
      <h2>Team Members</h2>
      {team.map((member, idx) => (
        <div key={idx} className="team-member-row">
          <span className="member-label">Member {idx + 1}</span>
          <span className="member-name">{member.name}</span>
        </div>
      ))}
    </div>
  );
}
