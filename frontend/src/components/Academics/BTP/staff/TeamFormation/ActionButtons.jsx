import React from "react";
import styles from "../styles/Overviewdialog.module.css";
import colorbell from "../../../../../assets/colorbell.png";
import whitebell from "../../../../../assets/whitebell.png";
import swap from "../../../../../assets/replace.png";
import whitereplace from "../../../../../assets/whitereplace.png";
import add from "../../../../../assets/addcolor.png";
import whiteadd from "../../../../../assets/addwhite.png";
import trash from "../../../../../assets/trashcan.png";
import whitetrash from "../../../../../assets/whitetrash.png";

export default function ActionButtons({ index, onReplace, onDelete, onAdd, mode }) {
  const [hoveredButton, setHoveredButton] = React.useState(null);

  return (
    <div className={styles.actionButtons}>
      <button
        className={styles.notification}
        onMouseEnter={() => setHoveredButton("notify")}
        onMouseLeave={() => setHoveredButton(null)}
        type="button"
      >
        <img src={hoveredButton === "notify" ? whitebell : colorbell} alt="Notify" />
      </button>


      <button
        className={styles.replace}
        onMouseEnter={() => setHoveredButton("replace")}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={mode === "replace" ? onReplace : onAdd}
        type="button"
      >
        <img
          src={
            hoveredButton === "replace"
              ? mode === "replace" ? whitereplace : whiteadd
              : mode === "replace" ? swap : add
          }
          alt={mode === "replace" ? "Replace" : "Add"}
        />
      </button>

      {mode === "replace" && (
        <button
          className={styles.trash}
          onMouseEnter={() => setHoveredButton("trash")}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={onDelete}
          type="button"
        >
          <img src={hoveredButton === "trash" ? whitetrash : trash} alt="Delete" />
        </button>
      )}
    </div>
  );
}
