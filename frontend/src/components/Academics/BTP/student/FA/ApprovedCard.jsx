import classes from "../../../../styles/FacultySelection.module.css";

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

        <div className={classes["requestcard-status"]}>
          <span className={classes["approved-icon"]}>✅</span>
          <span className={classes["approved-label"]}>Confirmed</span>
        </div>
      </div>
    </div>
  );
}
