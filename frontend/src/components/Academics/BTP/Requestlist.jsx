export default function RequestList({ requests }) {
  return (
    <div className="requestlist-wrapper">
      <h2 className="requestlist-title">Your Requests</h2>

      {requests.map((req, idx) => (
        <div className="requestcard" key={idx}>
          <div className="requestcard-main">
            <div>
              <h3 className="requestcard-topic">{req.requestedTopic.topic}</h3>
              <p className="requestcard-desc">{req.requestedTopic.about}</p>
            </div>
            <div className="requestcard-faculty">
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="icon"
                className="facultyassignment-avatar"
              />
              <span><strong>Faculty</strong><br />{req.faculty.name}</span>
            </div>
          </div>

          <div className="requestcard-status">
            {req.isapproved ? (
              <>
                <span className="approved-icon">✅</span>
                <span className="approved-label">Confirmed</span>
              </>
            ) : (
              <>
                <span className="pending-icon">🕒</span>
                <span className="pending-label">Pending...</span>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
