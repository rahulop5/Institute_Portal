import classes from "../../../../styles/FacultySelection.module.css";

export default function RequestList({ requests }) {
  return (
    <div className={classes["requestlist-wrapper"]}>
      <h2 className={classes["requestlist-title"]}>Your Requests</h2>

      {requests.map((req, idx) => (
        <div className={classes["requestcard"]} key={idx}>
          <div className={classes["requestcard-main"]}>
            <div>
              <h3 className={classes["requestcard-topic"]}>{req.requestedTopic.topic}</h3>
              <p className={classes["requestcard-desc"]}>{req.requestedTopic.about}</p>
            </div>
            <div className={classes["requestcard-faculty"]}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="icon"
                className={classes["facultyassignment-avatar"]}
              />
              <span>
                <strong>Faculty</strong>
                <br />
                {req.faculty.name}
              </span>
            </div>
          </div>

          <div className={classes["requestcard-status"]}>
            {req.isapproved ? (
              <>
                <span className={classes["approved-icon"]}>✅</span>
                <span className={classes["approved-label"]}>Confirmed</span>
              </>
            ) : (
              <>
                <span className={classes["pending-icon"]}>🕒</span>
                <span className={classes["pending-label"]}>Pending...</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
