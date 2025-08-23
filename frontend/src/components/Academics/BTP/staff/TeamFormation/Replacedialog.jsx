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
  unallocatedData,
  onConfirmReplace,
}) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const sameBin = selectedStudent?.bin?.id === member?.bin?.id;

  const handleConfirm = () => {
    if (!selectedStudent) return;
    if (!sameBin) return; // safety; also disabled in UI
    onConfirmReplace(selectedStudent, member, memberIndex);
    onClose();
  };

  return createPortal(
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.heading}>
          <h3 className={styles.overviewTitle}>Replace Member</h3>
          <h2 className={styles.teamName}>{teamName}</h2>
        </div>

        <div className={styles.memberDetails}>
          <p><strong>Replacing:</strong> {member?.student?.name} ({member?.student?.roll})</p>
          <p><strong>Bin required:</strong> {member?.bin?.id}</p>
        </div>

        <UnallocatedStudents
          unallocatedData={unallocatedData}
          isSelectMode={true}
          allowedBin={member?.bin?.id}
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
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
