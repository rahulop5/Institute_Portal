export default function RemarksCard({ latestRemark }) {
  return (
    <div className="remarks-card">
      <h2>Evaluation Remarks</h2>
      <div className="remark-content">
        <span>{latestRemark}</span>
      </div>
    </div>
  );
}
