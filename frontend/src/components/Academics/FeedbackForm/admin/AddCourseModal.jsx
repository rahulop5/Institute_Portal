import React, { useState } from "react";
import styles from "../styles/AddCourseModal.module.css";
import FacultySelectModal from "./FacultySelectModal";
import { useSubmit, redirect } from "react-router";

export default function AddCourseModal({ onClose, faculty }) {
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const submit=useSubmit();

  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    code: "",
    structure: "",
    credits: "",
    faculty: [],
    students: null,
  });

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle structure selection
  const handleStructureSelect = (type) => {
    setFormData((prev) => ({ ...prev, structure: type }));
  };

  // Handle credits selection
  const handleCreditsSelect = (num) => {
    setFormData((prev) => ({ ...prev, credits: num }));
  };

  // Handle faculty selection modal confirm
  const handleFacultyConfirm = (selected) => {
    setFormData((prev) => ({ ...prev, faculty: selected }));
    setShowFacultyModal(false);
  };

  // Remove selected faculty
  const handleRemoveFaculty = (id) => {
    setFormData((prev) => ({
      ...prev,
      faculty: prev.faculty.filter((f) => f.id !== id),
    }));
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, students: file }));
    }
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, students: file }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, students: null }));
  };

  // Final submit
  // Final submit
  const handleSubmit = async () => {
    if (!formData.students) {
      alert("Please upload a CSV file before submitting.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("code", formData.code);
    formDataToSend.append("abbreviation", formData.abbreviation);
    formDataToSend.append("credits", formData.credits);
    formDataToSend.append("coursetype", formData.structure);
    formDataToSend.append(
      "facultyEmails",
      JSON.stringify(formData.faculty.map((f) => f.email))
    );
    formDataToSend.append("file", formData.students);

    submit(formDataToSend, {
      method: "post",
      action: "/academics/feedback/admin/addcourse",
      encType: "multipart/form-data",
    });
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>

          <h2 className={styles.title}>Add course</h2>

          <div className={styles.formGrid}>
            {/* Left column */}
            <div className={styles.leftColumn}>
              <label className={styles.label}>
                Name:
                <input
                  type="text"
                  name="name"
                  placeholder="Type here..."
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </label>

              <div className={styles.twoCol}>
                <label className={styles.label}>
                  Abbreviation:
                  <input
                    type="text"
                    name="abbreviation"
                    placeholder="Type here..."
                    value={formData.abbreviation}
                    onChange={handleInputChange}
                  />
                </label>

                <label className={styles.label}>
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

              <div className={styles.fieldBlock}>
                <span className={styles.labelText}>Structure:</span>
                <div className={styles.btnGroup}>
                  {["Institute Core", "Elective", "Program Core"].map(
                    (type) => (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.optionBtn} ${
                        formData.structure === type ? styles.active : ""
                      }`}
                      onClick={() => handleStructureSelect(type)}
                    >
                      {type}
                    </button>
                    )
                  )}
                </div>
              </div>

              <div className={styles.fieldBlock}>
                <span className={styles.labelText}>Credits:</span>
                <div className={styles.btnGroup}>
                  {[2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`${styles.optionBtn} ${
                        formData.credits === num ? styles.active : ""
                      }`}
                      onClick={() => handleCreditsSelect(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className={styles.rightColumn}>
              <div className={styles.facultyHeader}>
                <span className={styles.labelText}>Faculty:</span>
              </div>

              <div className={styles.facultyContainer}>
                {formData.faculty.length > 0 ? (
                  formData.faculty.map((f, index) => (
                    <div key={f.id} className={styles.facultyItem}>
                      <span className={styles.facultyIndex}>
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                      <div className={styles.facultyInfo}>
                        <span className={styles.facultyName}>{f.name}</span>
                        <span className={styles.facultyEmail}>{f.email}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.removeFacultyBtn}
                        onClick={() => handleRemoveFaculty(f.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className={styles.facultyPlaceholder}>
                    No faculty selected
                  </p>
                )}
              </div>

              <button
                type="button"
                className={styles.addFacultyBtn}
                onClick={() => setShowFacultyModal(true)}
              >
                Add faculty
              </button>

              <label className={styles.label}>
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
                        className={styles.removeFileBtn}
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

// routes/courses.jsx or similar
export async function addCourseAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();

  const response = await fetch(
    "http://localhost:3000/puser/feedback/addcourse",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const err = await response.json();
    console.log(err)
    throw new Response(
      JSON.stringify({
        message: err.message || "Failed to upload student file",
      }),
      { status: response.status || 500 }
    );
  }

  const res = await response.json();

  return redirect("/academics/feedback/admin/courses");
}