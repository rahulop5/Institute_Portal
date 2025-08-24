import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/ReplaceDialog.module.css";
import UnallocatedStudents from "./UnallocatedStudents";

export default function ReplaceDialog({
  isOpen,
  onClose,
  member,
  memberIndex,
  teamName,
  mode,
  unallocatedData,
  onConfirmReplace,
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // For Replace, enforce same bin; for Add, allow any
  const sameBin = mode === "replace"
    ? selectedStudent?.bin?.id === member?.bin?.id
    : true;

const handleConfirm = () => {
  if (!selectedStudent) return;
  if (mode === "replace" && selectedStudent.bin.id !== member.bin.id) return;

  // Build the updatedTeam object
  const updatedTeam = { ...team };
  if (mode === "replace") {
    updatedTeam.members[memberIndex] = {
      student: selectedStudent.student,
      bin: selectedStudent.bin,
      isApproved: false
    };
  } else if (mode === "add") {
    updatedTeam.members[memberIndex] = {
      student: selectedStudent.student,
      bin: selectedStudent.bin,
      isApproved: false
    };
  }

  // Call onUpdateTeam with proper arguments
  onUpdateTeam(updatedTeam, member, mode, selectedStudent);

  onClose();
};


  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.heading}>
          <h3 className={styles.overviewTitle}>
            {mode === "replace" ? "Replace Member" : "Add Member"}
          </h3>
          <h2 className={styles.teamName}>{teamName}</h2>
        </div>

        {mode === "replace" && (
          <div className={styles.memberDetails}>
            <p><strong>Replacing:</strong> {member?.student?.name} ({member?.student?.roll})</p>
            <p><strong>Bin required:</strong> {member?.bin?.id}</p>
          </div>
        )}

        <UnallocatedStudents
          unallocatedData={unallocatedData}
          isSelectMode={true}
          allowedBin={mode === "replace" ? member?.bin?.id : null}
          onSelectStudent={(student) => setSelectedStudent(student)}
        />

        <div className={styles.footer}>
          <button className={styles.closeButton} onClick={onClose} type="button">Close</button>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!selectedStudent || !sameBin}
            type="button"
          >
            {mode === "replace" ? "Confirm" : "Add"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
