import classes from "../../../../styles/FacultySelection.module.css";
import tick from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import fadedclock from "../../../../../assets/fadedclock.png"

export default function RequestList({ requests }) {
  return (
    <div className={classes["requestlist-wrapper"]}>
      <h2 className={classes["requestlist-title"]}>Your Requests</h2>

      {requests.map((req, idx) => (
        <div className={classes["requestcard"]} key={idx}>
          <div className={classes["requestcard-main"]}>
            <div>
              <h3 className={classes["requestcard-topic"]}>
                {req.requestedTopic.topic}
              </h3>
              <p className={classes["requestcard-desc"]}>
                {req.requestedTopic.about}
              </p>
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
          <div className="status-container">
            <div className="status-item">
              <img
                src={pending}
                alt="Pending"
                className="status-icon active"
              />
              <span className="status-text active">Pending...</span>
            </div>
            <div className="status-line"></div>
            <div className="status-item">
              <div>
                <img src={fadedclock} alt="Confirmed" className="status-icon tick" />
                <span className="status-text">Confirmed</span>
              </div>
            </div>
          </div>

          
        </div>
      ))}
    </div>
  );
}
