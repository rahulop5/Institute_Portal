import classes from "../../../../styles/TeamSelectionbin1.module.css";

export default function TFBin23Requests({incomingRequests, studentIcon, handleAccept, handleReject}) {
  return (
  <div className={incomingRequests.length===0? undefined:classes["incoming-requests"]}>
    {incomingRequests.map((request, index) => (
      <div key={index} className={classes["request-card"]}>
        <div className={classes["request-info"]}>
          <img src={studentIcon} alt="avatar" />
          <div className={classes["request-details"]}>
            <strong>{request.bin1.name}</strong>
            <span>{request.bin1.email}</span>
          </div>
        </div>
        <div className={classes["action-buttons"]}>
          <button
            className={classes["reject-button"]}
            onClick={() => handleReject(request)}
          >
            Reject
          </button>
          <button
            className={classes["accept-button"]}
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
