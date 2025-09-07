import React, { useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/Overviewdialog.module.css";
import TeamMemberCard from "./TeamMemberCard";
import UnallocatedStudents from "./UnallocatedStudents";

export default function OverviewDialog({
  isOpen,
  onClose,
  team,
  teamsData,
  setTeamsData,
}) {
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null); // numeric bin (1 | 2 | 3)
  const [actionType, setActionType] = useState(null); // 'add' | 'replace'
  const [studentToAdd, setStudentToAdd] = useState(null);

  if (!isOpen) return null;

  // helper to handle both shapes: bin: 1  OR bin: { id: 1 }
  const normalizeBin = (b) => (b && typeof b === "object" ? b.id : b);

  const getStudentId = (m) =>
    (m && (m.email || (m.student && (m.student.email || m.student.roll)))) ||
    JSON.stringify(m);

  // OPEN MODALS
  const handleReplaceClick = (binNumber) => {
    setSelectedBin(binNumber);
    setActionType("replace");
    setStudentToAdd(null);
    setIsReplaceModalOpen(true);
  };

  const handleAddClick = (binNumber) => {
    setSelectedBin(binNumber);
    setActionType("add");
    setStudentToAdd(null);
    setIsReplaceModalOpen(true);
  };

  const handleCancelReplace = () => {
    setIsReplaceModalOpen(false);
    setSelectedBin(null);
    setActionType(null);
    setStudentToAdd(null);
  };

  // DELETE: remove member from team and push to unallocatedMembers
  const handleDeleteStudent = (binNumber) => {
    setTeamsData((prev) => {
      let removedMember = null;

      const updateTeamsList = (list) =>
        list.map((t) => {
          if (t.teamName !== team.teamName) return t;
          const newMembers = t.members.filter((m) => {
            if (normalizeBin(m.bin) === binNumber) {
              removedMember = m;
              return false;
            }
            return true;
          });
          return { ...t, members: newMembers, isTeamFormed: newMembers.length === 3 };
        });

      const updatedFully = updateTeamsList(prev.fullyFormedTeams || []);
      const updatedPartial = updateTeamsList(prev.partiallyFormedTeams || []);

      if (!removedMember) {
        // nothing removed -> no change
        return prev;
      }

      const unallocatedItem = {
        student: removedMember.student,
        bin: { id: normalizeBin(removedMember.bin) },
        email: removedMember.student?.email || removedMember.email || "",
      };

      return {
        ...prev,
        fullyFormedTeams: updatedFully,
        partiallyFormedTeams: updatedPartial,
        unallocatedMembers: [...(prev.unallocatedMembers || []), unallocatedItem],
      };
    });
  };

  // ADD: add selected unallocated student to the selected bin (only if empty)
  const performAdd = (binNumber, selectedUnallocated) => {
    if (!selectedUnallocated) return;

    setTeamsData((prev) => {
      const idToRemove = getStudentId(selectedUnallocated);

      const removeFromUnallocated = (list) =>
        (list || []).filter((u) => getStudentId(u) !== idToRemove);

      const addMemberToTeam = (list) =>
        (list || []).map((t) => {
          if (t.teamName !== team.teamName) return t;
          // if bin already occupied, do nothing
          const exists = t.members.some((m) => normalizeBin(m.bin) === binNumber);
          if (exists) return t;

          const newMember = {
            student: selectedUnallocated.student || selectedUnallocated,
            bin: binNumber, // team members use numeric bin in many of your samples
            isApproved: false,
          };

          const newMembers = [...t.members, newMember];
          return { ...t, members: newMembers, isTeamFormed: newMembers.length === 3 };
        });

      return {
        ...prev,
        fullyFormedTeams: addMemberToTeam(prev.fullyFormedTeams),
        partiallyFormedTeams: addMemberToTeam(prev.partiallyFormedTeams),
        unallocatedMembers: removeFromUnallocated(prev.unallocatedMembers),
      };
    });
  };

  // REPLACE: atomic remove old member (move to unallocated) + remove selected from unallocated and put into bin
  const performReplace = (binNumber, selectedUnallocated) => {
    if (!selectedUnallocated) return;

    setTeamsData((prev) => {
      const idToRemoveFromUnallocated = getStudentId(selectedUnallocated);
      let removedMember = null;

      const updateTeamsAndCollectRemoved = (list) =>
        (list || []).map((t) => {
          if (t.teamName !== team.teamName) return t;
          // remove any member in the bin
          const membersAfterRemoval = t.members.filter((m) => {
            if (normalizeBin(m.bin) === binNumber) {
              removedMember = m;
              return false;
            }
            return true;
          });

          // add the new student into the bin (as a new member)
          const newMember = {
            student: selectedUnallocated.student || selectedUnallocated,
            bin: binNumber,
            isApproved: false,
          };

          const newMembers = [...membersAfterRemoval, newMember];
          return { ...t, members: newMembers, isTeamFormed: newMembers.length === 3 };
        });

      const updatedFully = updateTeamsAndCollectRemoved(prev.fullyFormedTeams);
      const updatedPartial = updateTeamsAndCollectRemoved(prev.partiallyFormedTeams);

      // build unallocated list: remove selectedUnallocated, and add removedMember (if any)
      const filteredUnallocated = (prev.unallocatedMembers || []).filter(
        (u) => getStudentId(u) !== idToRemoveFromUnallocated
      );

      const addedBack = removedMember
        ? {
            student: removedMember.student,
            bin: { id: normalizeBin(removedMember.bin) },
            email: removedMember.student?.email || removedMember.email || "",
          }
        : null;

      return {
        ...prev,
        fullyFormedTeams: updatedFully,
        partiallyFormedTeams: updatedPartial,
        unallocatedMembers: addedBack ? [...filteredUnallocated, addedBack] : filteredUnallocated,
      };
    });
  };

  // Confirm (either add or replace)
  const handleConfirmAction = () => {
    if (!studentToAdd || !selectedBin) return;
    if (actionType === "add") {
      performAdd(selectedBin, studentToAdd);
    } else if (actionType === "replace") {
      performReplace(selectedBin, studentToAdd);
    }
    handleCancelReplace();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <>
      <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.heading}>
            <div>
              <h3 className={styles.overviewTitle}>Overview</h3>
            </div>
            <div>
              <h2 className={styles.teamName}>{team?.teamName}</h2>
            </div>
          </div>

          {/* Team Members: ALWAYS render 3 slots for bins 1..3 */}
          <div className={styles.cardsContainer}>
            {[1, 2, 3].map((binNumber, index) => {
              const member =
                (team?.members || []).find(
                  (m) => normalizeBin(m.bin) === binNumber
                ) || null;

              return (
                <TeamMemberCard
                  key={binNumber}
                  member={member}
                  index={binNumber} // pass bin number as index so action callbacks get it
                  onReplace={() => handleReplaceClick(binNumber)}
                  onDelete={() => handleDeleteStudent(binNumber)}
                  onNotify={() => console.log("Notify bin", binNumber)}
                  onAdd={() => handleAddClick(binNumber)}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.footerWarning}>
              ⚠ Deleting team operation is irreversible.
            </div>
            <div className={styles.footerButtons}>
              <button className={styles.submitButton} onClick={() => { /* optional submit handler if needed */ }}>
                Confirm
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => {
                  // Delete team entirely (still front-end only)
                  // remove team from both lists if present
                  setTeamsData((prev) => {
                    const filterTeam = (list) =>
                      (list || []).filter((t) => t.teamName !== team.teamName);
                    return {
                      ...prev,
                      fullyFormedTeams: filterTeam(prev.fullyFormedTeams),
                      partiallyFormedTeams: filterTeam(prev.partiallyFormedTeams),
                    };
                  });
                  onClose();
                }}
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Replace / Add modal */}
      {isReplaceModalOpen &&
        createPortal(
          <div className={styles.modalBackdrop} onClick={handleCancelReplace}>
            <div
              className={styles.replaceModal}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>
                {actionType === "add"
                  ? `Select a Student to Add (Bin ${selectedBin})`
                  : `Select a Student to Replace (Bin ${selectedBin})`}
              </h3>

              <UnallocatedStudents
                unallocatedData={teamsData.unallocatedMembers || []}
                onSelect={(student) => setStudentToAdd(student)}
                selectedStudent={studentToAdd}
                isSelectMode={true}
              />

              <div className={styles.modalActions}>
                <button onClick={handleCancelReplace}>Cancel</button>
                <button
                  onClick={handleConfirmAction}
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
