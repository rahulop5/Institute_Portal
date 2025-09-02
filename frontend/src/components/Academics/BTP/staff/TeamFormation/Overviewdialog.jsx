import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Overviewdialog.module.css";
import TeamMemberCard from "./TeamMemberCard";
import UnallocatedStudents from "./UnallocatedStudents";

export default function OverviewDialog({ isOpen, onClose, team, unallocated, setTeam, setUnallocated }) {
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [selectedMemberIndex, setSelectedMemberIndex] = useState(null);
    const [studentToAdd, setStudentToAdd] = useState(null);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleReplaceClick = (index) => {
        setSelectedMemberIndex(index);
        setIsReplaceModalOpen(true);
    };

    const handleCancelReplace = () => {
        setIsReplaceModalOpen(false);
        setSelectedMemberIndex(null);
        setStudentToAdd(null);
    };

    const handleConfirmReplace = () => {
        if (!studentToAdd) return;

        const memberToRemove = team.members[selectedMemberIndex];

        // Remove selected member from team and add to unallocated
        const updatedTeam = { ...team };
        updatedTeam.members[selectedMemberIndex] = {
            student: studentToAdd,
            bin: memberToRemove.bin,
            isApproved: false // reset approval for new student
        };

        setTeam(updatedTeam);

        // Update unallocated: remove added student and add removed one
        const updatedUnallocated = unallocated.filter(s => s.id !== studentToAdd.id);
        updatedUnallocated.push(memberToRemove.student);

        setUnallocated(updatedUnallocated);

        handleCancelReplace();
    };

    return createPortal(
        <>
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
                            <TeamMemberCard
                                key={index}
                                member={member}
                                index={index}
                                onReplace={handleReplaceClick}
                                onDelete={(i) => console.log("Delete", i)}
                                onNotify={(i) => console.log("Notify", i)}
                            />
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
            </div>

            {/* Replace Modal */}
            {isReplaceModalOpen &&
                createPortal(
                    <div className={styles.modalBackdrop}>
                        <div className={styles.replaceModal}>
                            <h3>Select a Student to Replace</h3>
                            <UnallocatedStudents
                                students={unallocated}
                                onSelect={(student) => setStudentToAdd(student)}
                                selectedStudent={studentToAdd}
                            />
                            <div className={styles.modalActions}>
                                <button onClick={handleCancelReplace}>Cancel</button>
                                <button
                                    onClick={handleConfirmReplace}
                                    disabled={!studentToAdd}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>,
        document.body
    );
}
