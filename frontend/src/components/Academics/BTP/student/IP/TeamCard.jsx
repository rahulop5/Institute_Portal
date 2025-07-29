import classes from "../../../../styles/Inprogress.module.css";

export default function TeamCard({ team }) {
  return (
    <div className={classes["team-card"]}>
      <h2>Team Members</h2>
      {team.map((member, idx) => (
        <div key={idx} className={classes["team-member-row"]}>
          <span className={classes["member-label"]}>Member {idx + 1}</span>
          <span className={classes["member-name"]}>{member.name}</span>
        </div>
      ))}
    </div>
  );
}
