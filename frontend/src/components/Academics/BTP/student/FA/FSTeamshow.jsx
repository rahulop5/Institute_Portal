import classes from "../../../../styles/TeamSelectionbin1.module.css";

export default function FSTeamthere({ teamData, studentIcon }) {
  return (
    <>
      <div className={classes["added-students"]}>
        <h2>Your Team</h2>
        <div className={classes["team-table"]}>
          {["bin1", "bin2", "bin3"].map((binKey) => {
            const member = teamData[binKey];
            return (
              <div className={classes["team-row"]} key={member.email}>
                <div className={classes["student-name-icon"]}>
                  <img
                    src={studentIcon}
                    alt="avatar"
                    className={classes["avatar-icon"]}
                  />
                  <span>{member.name}</span>
                </div>
                <span>{member.email}</span>
                <span>{member.rollno}</span>
                <span
                  className={`${classes["approval-status"]} ${
                    member.approved ? classes["approved"] : classes["pending"]
                  }`}
                >
                  {member.approved ? "✅ Approved" : "❌ Not Approved"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
