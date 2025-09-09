import styles from "../../../../styles/Updatelist.module.css";
import Buttons from "./Buttons";

export default function Updatelist({ data }) {
  // const role = localStorage.getItem("role");
  const role = "Faculty"; // for testing

  const updates = data?.project?.updates || [];
  const projid = data?.project?._id || "proj-001"; 
  const team = data?.project?.team || [];
  const isEvaluator = data?.isEvaluator || false;

  return (
    <div className={styles.list}>
      <h3 className={styles.heading}>Updates</h3>
      <div className={styles.listactions}>
        {updates.length > 0 ? (
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`}>
              <div className={styles.cellDate}>Date</div>
              <div className={styles.cellContent}>Update</div>
            </div>
            {updates.map((update, index) => {
              const date = new Date(update.time);
              const formattedDate = `${String(date.getDate()).padStart(
                2,
                "0"
              )}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
                date.getFullYear()
              ).slice(-2)}`;
              return (
                <div key={index} className={styles.row}>
                  <div className={styles.cellDate}>{formattedDate}</div>
                  <div className={styles.cellContent}>{update.update}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <></>
        )}
        {role === "Faculty" ? (
          <Buttons
            
            projid={data.project._id}
            team={data.project.team}
            isEvaluator={data.isEvaluator}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
