const temp2={
    "email": "vivaan.sneha21@example.com",
    "inteam": 1,
    "phase": "TF",
    "bin": 2,
    "message": "Full team",
    "team": {
        "_id": "686ea21605c14e3f3d14957d",
        "bin1": {
            "email": "vihaan.isha1@example.com",
            "name": "Vihaan Isha",
            "approved": true
        },
        "bin2": {
            "email": "vivaan.sneha21@example.com",
            "name": "Vivaan Sneha",
            "approved": true
        },
        "bin3": {
            "email": "diya.sai38@example.com",
            "name": "Diya Sai",
            "approved": true
        }
    }
}
import classes from "../../styles/TeamSelectionbin1.module.css";

export default function TFBin23teamthere({ approvedTeam, studentIcon }) {
  return (
    <div className={classes["added-students"]}>
      <h2>Your Team</h2>
      <div className={classes["team-table"]}>
        {[approvedTeam.bin1, approvedTeam.bin2, approvedTeam.bin3].map(
          (member, idx) => (
            <div key={idx} className={classes["team-row"]}>
              <div className={classes["student-name-icon"]}>
                <img src={studentIcon} alt="avatar" className={classes["avatar-icon"]} />
                <span>{member.name}</span>
              </div>
              <span>{member.email}</span>
              <span>{idx + 1}</span>
              <span
                className={`${classes["status"]} ${
                  member.approved ? classes["approved"] : classes["pending"]
                }`}
              >
                {member.approved ? "✔ Confirmed" : "⌛ Pending..."}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}