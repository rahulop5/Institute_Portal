export default function TFBin23Requests({incomingRequests, studentIcon, handleAccept, handleReject}) {
  return (
    <div className="incoming-requests">
      {incomingRequests.map((request, index) => (
        <div key={index} className="request-card">
          <div className="request-info">
            <img src={studentIcon} alt="avatar" />
            <div className="request-details">
              <strong>{request.bin1.name}</strong>
              <span>{request.bin1.email}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button className="reject-button" onClick={()=>handleReject(request)} >
              Reject
            </button>
            <button
              className="accept-button"
              onClick={() => handleAccept(request)}
            >
              Accept
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
