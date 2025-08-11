import classes from "../../../../styles/FacultySelection.module.css";
import tick from "../../../../../assets/confirmedtick.png";
import pending from "../../../../../assets/pendingclock.png";
import fadedtick from "../../../../../assets/fadedtick.png";


export default function ApprovedCard({ request }) {
  return (
    <div className={classes["requestlist-wrapper"]}>
      <h2 className={classes["requestlist-title"]}>Approved Topic</h2>

      <div className={classes["requestcard"]}>
        <div className={classes["requestcard-main"]}>
          <div>
            <h3 className={classes["requestcard-topic"]}>
              {request.requestedTopic.topic}
            </h3>
            <p className={classes["requestcard-desc"]}>
              {request.requestedTopic.about}
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
              {request.faculty.name}
            </span>
          </div>
        </div>

        <div class="status-container">
          <div class="status-item">
            <img src={fadedtick} alt="Pending" class="status-icon active" />
            <span class="status-text">Pending...</span>
          </div>
          <div class="status-line"></div>
          <div class="status-item">
            <div>
              <img src={tick} alt="Confirmed" class="status-icon tick" />
              <span class="status-text active">Confirmed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
