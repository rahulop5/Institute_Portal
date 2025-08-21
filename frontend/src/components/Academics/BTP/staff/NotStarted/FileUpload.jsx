import { useState } from "react";
import * as XLSX from "xlsx";
import styles from "../styles/FileUpload.module.css";
import fileUploadImage from "../../../../../assets/uploadfile.png";
import warning from "../../../../../assets/warning.png";
import PreviewModal from "./PreviewModal";
import csv from "../../../../../assets/csv.png";
import xmark from "../../../../../assets/xmark.png";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      parseExcel(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      parseExcel(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);
      setPreviewData(json);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className={styles.outerdiv}>
      <h2>Upload Files</h2>
      <p>
        Student record file following the correct prescribed format to be
        uploaded.
      </p>

      <div
        className={styles.fileUploadWrapper}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className={styles.fileUploadContainer}>
          <img src={fileUploadImage} alt="File Upload" />
          <p>Drag and drop file</p>
          <p>or</p>
          <button onClick={() => document.getElementById("fileInput").click()}>
            Browse Files
          </button>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx, .xls"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </div>

        <div className={styles.fileInformation}>
          <div className={styles.uploadedFile}>
            <div>
              <p>Uploaded file: </p>
            </div>
            {selectedFile && (
              <div className={styles.fileCard}>
                <img src={csv} alt="" />
                <div className={styles.fileName}>{selectedFile.name}</div>
                <button
                  className={styles.removeButton}
                  onClick={() => setSelectedFile(null)}
                >
                  <img src={xmark} alt="" />
                </button>
              </div>
            )}
          </div>
          <div className={styles.previewWrapper}>
            <div className={styles.warningWrapper}>
              <div>
                <img src={warning} alt="" />
              </div>
              <div>
                <p>Upload only allowed after mandatory preview check.</p>
              </div>
            </div>
            <div className={styles.previewButtonWrapper}>
              <button
                className={`${styles.previewButton} ${
                  selectedFile ? styles.active : styles.disabled
                }`}
                onClick={() => setShowPreview(true)}
                disabled={!selectedFile}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <PreviewModal
          previewData={previewData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
