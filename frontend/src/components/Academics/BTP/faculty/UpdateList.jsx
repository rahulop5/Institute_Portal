import styles from "../../../styles/Updatelist.module.css";
import Buttons from "./Buttons";

const updateData = () => [
  {
    time: "13/02/24",
    update:
      "Added dropout between layers to reduce overfitting. Switched to Adam optimizer. Accuracy and F1-score set as evaluation metrics.",
  },
  {
    time: "29/04/24",
    update:
      "Enabled batch training with size 64. Xavier initialization applied to weights. Validation loss tracked after each epoch.",
  },
];

export default function Updatelist({ projid, updates, team, isEvaluator }) {
  const role=localStorage.getItem("role");

  return (
    <div className={styles.list}>
      <h3 className={styles.heading}>Updates</h3>
      <div className={styles.listactions}>
        {updates.length>0?<div className={styles.table}>
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
        </div>: <></>}
        {role==="Faculty"?<Buttons team={team} projid={projid} isEvaluator={isEvaluator} />: <></>}
      </div>
    </div>
  );
}
