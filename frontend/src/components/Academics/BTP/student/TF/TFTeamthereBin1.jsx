import tick from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import classes from "../../../../styles/TeamSelectionbin1.module.css";
import timer from "../../../../../assets/timerwaiting.png";

export default function TFTeamthereBin1({ teamData, studentIcon }) {
  return (
    <>
      <div className={classes["added-students"]}>
        <h1>Your Team</h1>
        <div className={classes["team-tablebin1"]}>
          {["bin1", "bin2", "bin3"].map((binKey) => {
            const member = teamData.team[binKey];
            return (
              <div className={classes["team-rowbin1"]} key={member.email}>
                <div className={classes["student-name-icon"]}>
                  <img
                    src={studentIcon}
                    alt="avatar"
                    className={classes["avatar-iconbin1"]}
                  />
                  <div className={classes.memberdetails}>
                    <span>{member.name}</span>
                    <p>{member.email}</p>
                  </div>
                </div>
                <div className={classes["teamrow2"]}>
                  <div>
                    <p>{member.rollno}</p>
                  </div>
                  <span
                    className={`${classes["approval-status"]} ${
                      classes["spanclasstf"]
                    } ${
                      member.approved ? classes["approved"] : classes["pending"]
                    }`}
                  >
                    {member.approved ? (
                      <p className={classes["statusintfbin1"]}>
                        <div>
                          <img src={tick} alt="Approved" />
                        </div>
                        <div>
                          <p>Approved</p>
                        </div>
                      </p>
                    ) : (
                      <p className={classes["statusintfbin1"]}>
                        <div>
                          <img src={pending} alt="Not Approved" />
                        </div>
                        <div>
                          <p>Not Approved</p>
                        </div>
                      </p>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className={classes["fasentence"]}>
          <div>
            <img src={timer} alt="" />
          </div>
          <div>
            <p>Topic selection yet to be done. Please wait....</p>
          </div>
        </div>
      </div>
    </>
  );
}
