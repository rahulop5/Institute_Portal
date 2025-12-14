import { useState } from "react";
import { redirect, useSubmit } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as XLSX from "xlsx";
import styles from "../styles/addFacultyModal.module.css";
import fileUploadImage from "../../../../assets/uploadfile.png";
import warning from "../../../../assets/warning.png";
import csv from "../../../../assets/csv.png";
import xmark from "../../../../assets/xmark.png";

import PreviewModal from "./PreviewModal.jsx";

import { API_HOST } from "../../../../config";

export default function StudentFileModal({ onClose, onConfirm }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const submit = useSubmit();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      parseExcel(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      parseExcel(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Use defval:"" to ensure empty cells become empty strings
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreviewData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = null; // Reset the file input
  };

  // This is called *from* the PreviewModal
  const handleConfirmUpload = () => {
    if (!selectedFile) return;

    // Show toast immediately
    toast.success("Successfully uploaded data", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    const formData = new FormData();
    formData.append("file", selectedFile); // send actual file

    submit(formData, {
      method: "post",
      action: "/academics/feedback/admin/addStudentsCSV", // route pointing to addStudentsAction
      encType: "multipart/form-data",
    });

    setShowPreview(false);
    // Don't close the modal immediately to let the toast show
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    // 1. Structure from AddFacultyModal
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* 2. Header from AddFacultyModal */}
        <div className={styles.modalHeader}>
          <h2 className={styles.title}>Add Students from CSV File</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 3. Content Body (merging FileUpload logic) */}
        <div className={styles.modalBody}>
          <div
            className={`${styles.fileUploadWrapper} ${
              isDragging ? styles.dragActive : ""
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragLeave={handleDragLeave}
          >
            {/* --- Left Side: Dropzone --- */}
            <div className={styles.fileUploadContainer}>
              <img src={fileUploadImage} alt="File Upload" />
              <p>Drag and drop file</p>
              <p>or</p>
              <button
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                Browse Files
              </button>
              <input
                id="fileInput"
                type="file"
                accept=".xlsx, .xls, .csv" // Accept Excel and CSV
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </div>

            {/* --- Right Side: File Info & Preview --- */}
            <div className={styles.fileInformation}>
              <div className={styles.uploadedFile}>
                <p>Uploaded file: </p>
                {selectedFile ? (
                  <div className={styles.fileCard}>
                    <img src={csv} alt="file icon" />
                    <div className={styles.fileName}>{selectedFile.name}</div>
                    <button className={styles.removeButton} onClick={clearFile}>
                      <img src={xmark} alt="remove" />
                    </button>
                  </div>
                ) : (
                  <div className={styles.noFile}>No file selected.</div>
                )}
              </div>

              <div className={styles.previewWrapper}>
                <div className={styles.warningWrapper}>
                  <img src={warning} alt="warning" />
                  <p>Upload only allowed after mandatory preview check.</p>
                </div>
                <div className={styles.previewButtonWrapper}>
                  <button
                    className={`${styles.previewButton} ${
                      selectedFile ? styles.active : styles.disabled
                    }`}
                    onClick={() => setShowPreview(true)}
                    disabled={!selectedFile || previewData.length === 0}
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* No 'Confirm' button here; confirmation happens in PreviewModal */}
      </div>

      {/* 4. Preview Modal Logic from FileUpload */}
      {showPreview && (
        <PreviewModal
          previewData={previewData}
          onClose={() => setShowPreview(false)}
          // Pass the final confirmation handler to the preview modal
          onConfirm={handleConfirmUpload}
        />
      )}
    </div>
  );
}


export async function addStudentsAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData(); // includes "file"
  const file = formData.get("file");

  const backendFormData = new FormData();
  backendFormData.append("file", file);

  const response = await fetch(API_HOST + "/puser/feedback/addStudentsCSV", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: backendFormData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Response(
      JSON.stringify({
        message: err.message || "Failed to upload student file",
      }),
      { status: response.status || 500 }
    );
  }

  const res = await response.json();

  return redirect("/academics/feedback/admin/students");
}

