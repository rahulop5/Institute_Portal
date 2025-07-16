import { useState } from "react";

export default function EvaluationDetails({ evaluations, latestUpdates }) {
  const [currentEvalIndex, setCurrentEvalIndex] = useState(0);
  const currentEval = evaluations[currentEvalIndex];

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString("en-GB"); // DD-MM-YYYY
    const timeStr = date.toLocaleTimeString("en-GB", { hour12: false });
    return { dateStr, timeStr };
  }

  
  const combinedUpdates =
    currentEvalIndex === 0
      ? [...(currentEval?.updates || []), ...(latestUpdates || [])]
      : currentEval?.updates || [];

  return (
    <div className="evaluation-details-container">
      <div className="evaluation-header">
        <h2>Evaluation</h2>
        <div className="eval-index-nav">
          <button
            onClick={() => setCurrentEvalIndex(i => Math.max(0, i - 1))}
            disabled={currentEvalIndex === 0}
          >
            &#60;
          </button>
          <span>{currentEvalIndex + 1}.0</span>
          <button
            onClick={() =>
              setCurrentEvalIndex(i =>
                Math.min(evaluations.length - 1, i + 1)
              )
            }
            disabled={currentEvalIndex === evaluations.length - 1}
          >
            &#62;
          </button>
        </div>
      </div>

      <div className="evaluation-table">
        <div className="eval-table-header">
          <span>Timestamp</span>
          <span>Update</span>
          <span>Remarks</span>
        </div>

        {combinedUpdates.map((update, idx) => {
          const { dateStr, timeStr } = formatDateTime(update.time);
          return (
            <div key={update._id || idx} className="eval-table-row">
              <div className="eval-timestamp">
                <strong>{dateStr}</strong>
                <div>{timeStr}</div>
              </div>
              <div>{update.update}</div>
              <div>
                {currentEval?.remark
                  ? currentEval.remark
                  : <i>No Remarks are given yet.</i>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 