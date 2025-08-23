import React from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Overviewdialog.module.css";
import TeamMemberCard from "./TeamMemberCard";

export default function OverviewDialog({ isOpen, onClose, team }) {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.heading}>
                    <div>
                        <h3 className={styles.overviewTitle}>Overview</h3>
                    </div>
                    <div>
                        <h2 className={styles.teamName}>{team?.teamName}</h2>
                    </div>
                </div>

                {/* Team Members */}
                <div className={styles.cardsContainer}>
                    {team?.members?.map((member, index) => (
                        <TeamMemberCard key={index} member={member} index={index} />
                    ))}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <div className={styles.footerWarning}>
                        ⚠️ Deleting team operation is irreversible.
                    </div>
                    <div className={styles.footerButtons}>
                        <button className={styles.submitButton}>Confirm</button>
                        <button className={styles.deleteButton}>Delete Team</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
