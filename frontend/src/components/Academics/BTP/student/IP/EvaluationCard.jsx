export default function EvaluationCard({ evaluations }) {
  function formatDate(isoString) {
    if (!isoString) return "Not Occurred";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // Format: DD-MM-YYYY
  }

  return (
    <div className="evaluation-card">
      <h2>Evaluation</h2>
      {evaluations.map((evalItem, index) => (
        <div key={index} className="evaluation-row">
          <span>Evaluation {index + 1}</span>
          <span>{formatDate(evalItem.time)}</span>
        </div>
      ))}
    </div>
  );
}
