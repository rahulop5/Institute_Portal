import styles from "../styles/PreviewModal.module.css";
import studenticon from "../../../../../assets/studenticon.svg";

export default function PreviewModal({ previewData, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        
        {/* Heading */}
        <div className={styles.header}>
          <h2>Preview</h2>
        </div>

        {/* Table */}
        <div className={`${styles.tableSection} ${styles.scrollableList}`}>
          <table>
            <thead>
              <tr>
                <th>S.no</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Bin</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td className={styles.nameCell}>
                    <img
                      src={studenticon}
                      alt="Profile"
                      className={styles.profileIcon}
                    />
                    {row.Name}
                  </td>
                  <td>{row["Roll Number"]}</td>
                  <td>{row.Bin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" />
            I acknowledge that the upload of this file is <strong>irreversible</strong>
            and triggers phase shift for all users.
          </label>
          <button onClick={onClose} className={styles.confirmButton}>
            Confirm
          </button>
        </div>
        
      </div>
    </div>
  );
}
