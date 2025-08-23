import React from "react";
import styles from "../styles/Overviewdialog.module.css";
import colorbell from "../../../../../assets/colorbell.png";
import whitebell from "../../../../../assets/whitebell.png";
import swap from "../../../../../assets/replace.png";
import whitereplace from "../../../../../assets/whitereplace.png";
import trash from "../../../../../assets/trashcan.png";
import whitetrash from "../../../../../assets/whitetrash.png";

export default function ActionButtons({ index }) {
    const [hoveredButton, setHoveredButton] = React.useState(null);

    return (
        <div className={styles.actionButtons}>
            <button
                className={styles.notification}
                onMouseEnter={() => setHoveredButton("notify")}
                onMouseLeave={() => setHoveredButton(null)}
            >
                <img
                    src={hoveredButton === "notify" ? whitebell : colorbell}
                    alt="Notify"
                />
            </button>

            <button
                className={styles.replace}
                onMouseEnter={() => setHoveredButton("replace")}
                onMouseLeave={() => setHoveredButton(null)}
            >
                <img
                    src={hoveredButton === "replace" ? whitereplace : swap}
                    alt="Swap"
                />
            </button>

            <button
                className={styles.trash}
                onMouseEnter={() => setHoveredButton("trash")}
                onMouseLeave={() => setHoveredButton(null)}
            >
                <img
                    src={hoveredButton === "trash" ? whitetrash : trash}
                    alt="Delete"
                />
            </button>
        </div>
    );
}
