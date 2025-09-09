import { useState } from "react";
import classes from "../../../../styles/Inprogress.module.css";

export default function EvaluationDetails({ evaluations, latestUpdates }) {
  const [showAll, setShowAll] = useState(false);

  // Combine all updates from all evaluations + latest ones
  const allUpdates = [
    ...(latestUpdates || []),
    ...evaluations.flatMap((evalObj) => evalObj.updates || []),
  ];

 
  const sortedUpdates = allUpdates.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );


  const visibleUpdates = showAll ? sortedUpdates : sortedUpdates.slice(0, 4);

  function formatDateTime(isoString) {
    const date = new Date(isoString);
    const dateStr = date.toLocaleDateString("en-GB");
    const timeStr = date.toLocaleTimeString("en-GB", { hour12: false });
    return { dateStr, timeStr };
  }

  return (
    <div className={classes["evaluation-details-container"]}>
      <div className={classes["evaluation-header"]}>
        <h2>Project Updates</h2>
      </div>

      <div className={classes["parentdivshowupdates"]}>
        <div className={classes["evaluation-table"]}>
          <div className={classes["eval-table-header"]}>
            <span>Time</span>
            <span>Update</span>
            <span>Remarks</span>
          </div>

          {visibleUpdates.map((update, idx) => {
            const { dateStr, timeStr } = formatDateTime(update.time);
            const remark = update?.remark || <i>No Remarks are given yet.</i>;
            return (
              <div
                key={update._id || idx}
                className={classes["eval-table-row"]}
              >
                <div className={classes["eval-timestamp"]}>
                  <strong>{dateStr}</strong>
                  <div>{timeStr}</div>
                </div>
                <div>{update.update}</div>
                <div>{remark}</div>
              </div>
            );
          })}
        </div>

        {sortedUpdates.length > 4 && (
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <button
              className={classes["toggle-project-updates-btn"]}
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : "Show All"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
