// AddCourseModal.js (Fully Corrected)

import React, { useState } from "react";
import styles from "../styles/AddCourseModal.module.css";
import FacultySelectModal from "./FacultySelectModal";

export default function AddCourseModal({ onClose, faculty }) {
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    code: "",
    structure: "",
    credits: "",
    faculty: [],
    students: null,
  });

  console.log("Form Data State:", faculty);
  const [showFacultyModal, setShowFacultyModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, students: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, students: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, students: null }));
  };

  const handleSubmit = () => {
    const submissionData = {
      ...formData,
      faculty: formData.faculty.map((f) => f.id),
    };
    console.log("Course Added:", submissionData);
    onClose();
  };

  const handleFacultyConfirm = (selectedFaculty) => {
    setFormData((prev) => ({
      ...prev,
      faculty: selectedFaculty,
    }));
    setShowFacultyModal(false);
  };

  const handleRemoveFaculty = (facultyIdToRemove) => {
    setFormData((prev) => ({
      ...prev,
      faculty: prev.faculty.filter((f) => f.id !== facultyIdToRemove),
    }));
  };

  return (
    <>
   
     
      <div className={styles.overlay} onClick={onClose}>
  
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
          <h2 className={styles.title}>Add course</h2>

          <div className={styles.form}>
            <div className={styles.leftColumn}>
             
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  placeholder="Type here..."
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </label>

              <div className={styles.row}>
                <label>
                  Abbreviation:
                  <input
                    type="text"
                    name="abbreviation"
                    placeholder="Type here..."
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                  />
                </label>
                <label>
                  Code:
                  <input
                    type="text"
                    name="code"
                    placeholder="Type here..."
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className={styles.structure}>
                <span>Structure:</span>
                <div className={styles.btnGroup}>
                  {["Institute Core", "Elective", "Program Core"].map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        className={
                          formData.structure === type ? styles.active : ""
                        }
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, structure: type }))
                        }
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className={styles.credits}>
                <span>Credits:</span>
                <div className={styles.btnGroup}>
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={formData.credits === num ? styles.active : ""}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, credits: num }))
                      }
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <label>
                Faculty:
             
               
                <div
                  className={styles.facultyPillContainer}
                
                >
                  {formData.faculty.length > 0 ? (
                    formData.faculty.map((f) => (
                      <div key={f.id} className={styles.facultyPill}>
                        <span>{f.name}</span>

                        <button
                          type="button"
                          className={styles.removePillBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFaculty(f.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className={styles.facultyPillPlaceholder}>
                      Add faculty here...
                    </span>
                  )}
                </div>
              </label>
              <div className={styles.addFacultyBtnContainer}>
                <button
                  type="button"
                  className={styles.addFacultyBtn}
                  onClick={() => setShowFacultyModal(true)}
                >
                  Add faculty
                </button>
              </div>

             
              <label>
                Students:
                <div
                  className={styles.uploadBox}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="studentFileInput"
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                  />

                  {!formData.students ? (
                    <span>
                      Drag and drop file or{" "}
                      <label
                        htmlFor="studentFileInput"
                        className={styles.browseBtn}
                      >
                        Browse file
                      </label>
                    </span>
                  ) : (
                    <div className={styles.fileInfo}>
                      <p className={styles.fileName}>
                        {formData.students.name}
                      </p>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={handleRemoveFile}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className={styles.confirmRow}>
            <button className={styles.confirmBtn} onClick={handleSubmit}>
              Confirm
            </button>
          </div>
        </div>
      </div>

      {showFacultyModal && (
        <FacultySelectModal
          allFaculty={faculty}
          currentlySelected={formData.faculty.map((f) => f.id)}
          onConfirm={handleFacultyConfirm}
          onClose={() => setShowFacultyModal(false)}
        />
      )}
    </>
  );
}