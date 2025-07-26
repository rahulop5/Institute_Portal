export default function ProgressCard({ evaluations }) {
  const progressPercent = (evaluations.filter(e => e.time).length / 3) * 100;

  return (
    <div className="progress-card">
      <h2>Evaluation Progress</h2>
      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        />
        <div className="progress-tick" style={{ left: "33%" }} />
        <div className="progress-tick" style={{ left: "66%" }} />
        <div className="progress-tick" style={{ left: "99%" }} />
      </div>
    </div>
  );
}
