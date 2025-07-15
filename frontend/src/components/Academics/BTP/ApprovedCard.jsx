export default function ApprovedCard({ request }) {
  return (
    <div className="requestlist-wrapper">
      <h2 className="requestlist-title">Approved Topic</h2>

      <div className="requestcard">
        <div className="requestcard-main">
          <div>
            <h3 className="requestcard-topic">{request.requestedTopic.topic}</h3>
            <p className="requestcard-desc">{request.requestedTopic.about}</p>
          </div>
          <div className="requestcard-faculty">
            <img
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              alt="icon"
              className="facultyassignment-avatar"
            />
            <span>
              <strong>Faculty</strong>
              <br />
              {request.faculty.name}
            </span>
          </div>
        </div>

        <div className="requestcard-status">
          <span className="approved-icon">✅</span>
          <span className="approved-label">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
