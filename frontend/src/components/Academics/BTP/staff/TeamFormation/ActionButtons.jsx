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

export default function ActionButtons({ index, isApproved, onNotify, onReplace, onDelete }) {
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
            {/* Notify Button */}
            <button
                className={`${styles.notification} ${isApproved ? styles.inactive : ""}`}
                disabled={isApproved}
                onClick={() => !isApproved && onNotify(index)}
                onMouseEnter={() => handleMouseEnter("notify")}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={hoveredButton === "notify" ? whitebell : colorbell}
                    alt="Notify"
                />
            </button>

            {/* Replace Button */}
            <button
                className={styles.replace}
                onClick={() => onReplace(index)}
                onMouseEnter={() => handleMouseEnter("replace")}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={hoveredButton === "replace" ? whitereplace : swap}
                    alt="Swap"
                />
            </button>

            {/* Delete Button */}
            <button
                className={styles.trash}
                onClick={() => onDelete(index)}
                onMouseEnter={() => handleMouseEnter("trash")}
                onMouseLeave={handleMouseLeave}
            >
                <img
                    src={hoveredButton === "trash" ? whitetrash : trash}
                    alt="Delete"
                />
            </button>
        </div>
    );
}
