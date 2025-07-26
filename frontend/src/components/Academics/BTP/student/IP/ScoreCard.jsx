export default function ScoreCard({ currentScore }) {
  return (
    <div className="score-card">
      <h2>Current Score</h2>
      <div className="score-value">
        <div className="score-main">{currentScore}</div>
        <div className="score-outof">/ 50</div>
      </div>
    </div>
  );
}
