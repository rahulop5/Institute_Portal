import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Overviewdialog.module.css";
import TeamMemberCard from "./TeamMemberCard";
import ReplaceDialog from "./ReplaceDialog";

export default function OverviewDialog({ isOpen, onClose, team, unallocatedData, onConfirmReplace }) {
  if (!isOpen) return null;

  const [replaceIndex, setReplaceIndex] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const closeReplaceDialog = () => setReplaceIndex(null);

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.heading}>
          <div><h3 className={styles.overviewTitle}>Overview</h3></div>
          <div><h2 className={styles.teamName}>{team?.teamName}</h2></div>
        </div>

        <div className={styles.cardsContainer}>
          {team?.members?.map((member, index) => (
            <TeamMemberCard
              key={index}
              member={member}
              index={index}
              onReplace={() => setReplaceIndex(index)}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerWarning}>⚠️ Deleting team operation is irreversible.</div>
          <div className={styles.footerButtons}>
            <button className={styles.submitButton}>Confirm</button>
            <button className={styles.deleteButton}>Delete Team</button>
          </div>
        </div>
      </div>

      {replaceIndex !== null && (
        <ReplaceDialog
          isOpen={true}
          onClose={closeReplaceDialog}
          member={team?.members?.[replaceIndex]}
          memberIndex={replaceIndex}
          teamName={team?.teamName}
          unallocatedData={unallocatedData}
          onConfirmReplace={(newStudent, oldMember, memberIndex) =>
            onConfirmReplace(newStudent, oldMember, memberIndex, team.teamName)
          }
        />
      )}
    </div>,
    document.body
  );
}
