import tick from "../../../assets/confirmedtick.png";
import pending from "../../../assets/pendingclock.png";
import classes from "../../styles/TeamSelectionbin1.module.css";

export default function TFTeamthereBin1({ teamData, studentIcon }) {
  return (
    <>
      <div className={classes["added-students"]}>
        <h1>Your Team</h1>
        <div className={classes["team-table"]}>
          {["bin1", "bin2", "bin3"].map((binKey) => {
            const member = teamData.team[binKey];
            return (
              <div className={classes["team-row"]} key={member.email}>
                <div className={classes["student-name-icon"]}>
                  <img src={studentIcon} alt="avatar" className={classes["avatar-icon"]} />
                  <span>{member.name}</span>
                </div>
                <span>{member.email}</span>
                <span>{member.rollno}</span>
                <span className={`${classes["approval-status"]} ${classes["spanclasstf"]} ${member.approved ? classes["approved"] : classes["pending"]}`}>
                  {member.approved ? (
                    <p className={classes["statusintf"]}>
                      <img src={tick} alt="Approved" />Approved
                    </p>
                  ) : (
                    <p className={classes["statusintf"]}>
                      <img src={pending} alt="Pending" />Not Approved
                    </p>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
