import styles from "../styles/previewModal.module.css";
export default function PreviewModal({ onClose, previewData, onConfirm }) {
  
  const handleConfirmClick = () => {
  
    onConfirm(previewData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>Preview Data</h2>
          <button onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.tableContainer}>
          {/* Your table logic to map over 'previewData' */}
          <table>
            <thead>
              <tr>
                {/* Dynamically create headers from the data */}
                {previewData.length > 0 &&
                  Object.keys(previewData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          {/* 3. Add a confirm button that triggers the upload */}
          <button 
            className={styles.confirmBtn} 
            onClick={handleConfirmClick}
          >
            Confirm and Upload
          </button>
        </div>
      </div>
    </div>
  );
}