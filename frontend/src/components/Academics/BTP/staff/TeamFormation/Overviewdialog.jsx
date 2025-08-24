import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Overviewdialog.module.css";
import TeamMemberCard from "./TeamMemberCard";
import ReplaceDialog from "./ReplaceDialog";
import ConfirmationDialog from "./Confirmationdialog";

export default function OverviewDialog({ isOpen, onClose, team, unallocatedData, onUpdateTeam }) {
  if (!isOpen) return null;

  const [replaceIndex, setReplaceIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const closeReplaceDialog = () => setReplaceIndex(null);

const handleDeleteConfirm = () => {
  const updatedTeam = { ...team };
  const removedMember = updatedTeam.members[deleteIndex];

  // Set that member to null (Add Member placeholder)
  updatedTeam.members = [...updatedTeam.members];
  updatedTeam.members[deleteIndex] = null;

  // Pass mode="delete" and removedMember
  onUpdateTeam(updatedTeam, removedMember, "delete");
  setDeleteIndex(null);
};

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.heading}>
          <h3 className={styles.overviewTitle}>Overview</h3>
          <h2 className={styles.teamName}>{team?.teamName}</h2>
        </div>

        <div className={styles.cardsContainer}>
          {team?.members?.map((member, index) => (
            <TeamMemberCard
              key={index}
              member={member}
              index={index}
              onReplace={() => setReplaceIndex({ index, mode: "replace" })}
              onDelete={() => setDeleteIndex(index)}
              onAdd={() => setReplaceIndex({ index, mode: "add" })}
            />
          ))}
        </div>

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

      {replaceIndex !== null && (
        <ReplaceDialog
          isOpen={true}
          onClose={closeReplaceDialog}
          member={replaceIndex.mode === "replace" ? team?.members?.[replaceIndex.index] : null}
          memberIndex={replaceIndex.index}
          teamName={team?.teamName}
          mode={replaceIndex.mode}
          unallocatedData={unallocatedData}
          onConfirmReplace={(newStudent, oldStudent, index) => {
            const updatedTeam = { ...team };
            updatedTeam.members[index] = {
              student: newStudent.student,
              bin: newStudent.bin,
              isApproved: false
            };

            // Pass mode to parent so it can update unallocatedData correctly
            const mode = replaceIndex.mode;
            onUpdateTeam(updatedTeam, oldStudent, mode, newStudent);

            closeReplaceDialog();
          }}
        />
      )}

      {deleteIndex !== null && (
        <ConfirmationDialog
          isOpen={true}
          message={`Are you sure you want to delete ${team.members[deleteIndex]?.student?.name}?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteIndex(null)}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </div>,
    document.body
  );
}
