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

export default function ActionButtons({
  index,
  isApproved,
  onDelete,
  onReplace,
  onNotify,
  onAdd,
  member
}) {
  const [hoveredButton, setHoveredButton] = React.useState(null);

  const handleMouseEnter = (button) => {
    if (!isApproved || button !== "notify") {
      setHoveredButton(button);
    }
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  return (
    <div className={styles.actionButtons}>
      {/* Notify button */}
      <button
        className={`${styles.notification} ${isApproved ? styles.inactive : ""}`}
        disabled={isApproved}
        onClick={() => !isApproved && onNotify && onNotify(index)}
        onMouseEnter={() => handleMouseEnter("notify")}
        onMouseLeave={handleMouseLeave}
      >
        <img src={hoveredButton === "notify" ? whitebell : colorbell} alt="Notify" />
      </button>

      {/* Replace button */}
      {member===true?<button
        className={styles.replace}
        onClick={() => onReplace && onReplace(index)}
        onMouseEnter={() => handleMouseEnter("replace")}
        onMouseLeave={handleMouseLeave}
      >
        <img src={hoveredButton === "replace" ? whitereplace : swap} alt="Swap" />
      </button>:<></>}

      {/* Add button (visible/usable for empty slot) */}
      {member===false?<button
        className={styles.replace}
        onClick={() => onAdd && onAdd(index)}
        onMouseEnter={() => handleMouseEnter("add")}
        onMouseLeave={handleMouseLeave}
      >
        <img src={hoveredButton === "add" ? whiteadd : add} alt="Add" />
      </button>:<></>}

      {/* Delete button */}
      <button
        className={styles.trash}
        onClick={() => onDelete && onDelete(index)}
        onMouseEnter={() => handleMouseEnter("trash")}
        onMouseLeave={handleMouseLeave}
      >
        <img src={hoveredButton === "trash" ? whitetrash : trash} alt="Delete" />
      </button>
    </div>
  );
}
