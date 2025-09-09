import classes from "../../../../styles/Inprogress.module.css";

export default function RemarksCard({ latestRemark }) {
  return (
    <div className={classes["remarks-card"]}>
      <h2>Evaluation Remarks</h2>
      <div className={classes["remark-content"]}>
        <span>{latestRemark}</span>
      </div>
    </div>
  );
}