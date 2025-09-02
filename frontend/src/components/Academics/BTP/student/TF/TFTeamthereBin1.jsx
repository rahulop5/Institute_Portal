import tick from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import timer from "../../../../../assets/timerwaiting.png";
import classes from "../../../../styles/TeamSelectionbin1.module.css";

export default function TFTeamthereBin1({
  teamData,
  studentIcon,
  onAddMember,
}) {
  const bins = ["bin1", "bin2", "bin3"];

  return (
    <div className={classes["added-students"]}>
      <h1>Your Team</h1>
      <div className={classes["team-tablebin1"]}>
        {bins.map((binKey) => {
          const member = teamData.team[binKey];

          return (
            <div className={classes["team-rowbin1"]} key={binKey}>
              {member ? (
                // Existing member
                <>
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
                        member.approved
                          ? classes["approved"]
                          : classes["pending"]
                      }`}
                    >
                      {member.approved ? (
                        <div className={classes["statusintfbin1"]}>
                          <img src={tick} alt="Approved" />
                          <p>Approved</p>
                        </div>
                      ) : (
                        <div className={classes["statusintfbin1"]}>
                          <img src={pending} alt="Not Approved" />
                          <p>Not Approved</p>
                        </div>
                      )}
                    </span>
                  </div>
                </>
              ) : (
                // Empty bin → show add button
                <>
                  <div className={classes["student-name-icon"]}>
                    <img
                      src={studentIcon}
                      alt="avatar"
                      className={classes["avatar-iconbin1"]}
                    />
                    <div className={classes.memberdetails}>
                      <span>No Student Found</span>
                    </div>
                  </div>
                  <div className={classes["teamrow2"]}>
                    <div>
                      <p>No Roll Number</p>
                    </div>
                    <button
                      className={classes["facultytopics-button"]}
                      onClick={() => handleApply(topic)}
                    >
                      Add Student
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className={classes["fasentence"]}>
        <img src={timer} alt="" />
        <p>Topic selection yet to be done. Please wait....</p>
      </div>
    </div>
  );
}
