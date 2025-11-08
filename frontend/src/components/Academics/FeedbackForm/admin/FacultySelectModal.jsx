
import React, { useState, useMemo } from "react";
import styles from "../styles/FacultySelectModal.module.css";

export default function FacultySelectModal({
  allFaculty,
  currentlySelected,
  onClose,
  onConfirm,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set(currentlySelected));

  const filteredFaculty = useMemo(() => {
    return allFaculty.filter((faculty) =>
      faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFaculty, searchTerm]);

  const handleToggleSelect = (facultyId) => {
    setSelectedIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(facultyId)) {
        newIds.delete(facultyId);
      } else {
        newIds.add(facultyId);
      }
      return newIds;
    });
  };

  const handleConfirmClick = () => {
    const selectedFacultyObjects = allFaculty.filter((f) =>
      selectedIds.has(f.id) 
    );
    onConfirm(selectedFacultyObjects);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add Faculty</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <input
          type="text"
          placeholder="Search faculty..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <table className={styles.facultyTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculty.map((faculty) => {
              const isSelected = selectedIds.has(faculty.id); 
              return (
                <tr key={faculty.id}> 
                  <td>{faculty.name}</td>
                  <td>{faculty.email || "N/A"}</td>
                  <td>
                    <button
                      className={`${styles.selectBtnSmall} ${
                        isSelected ? styles.selectedBtn : ""
                      }`}
                      onClick={() => handleToggleSelect(faculty.id)} 
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.modalFooter}>
          <button className={styles.confirmBtn} onClick={handleConfirmClick}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}