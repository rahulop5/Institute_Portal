import styles from "./EvaluatorModal.module.css";
import { FaUserCircle } from "react-icons/fa";
import idcard from "../assets/idcard.svg";
import bin from "../assets/bin.svg";

export default function EvaluatorModal({ students, onSubmit, onClose }) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2 className={styles.heading}>Evaluation</h2>

        <div className={styles.cardsContainer}>
          {students.map((student) => (
            <div key={student._id} className={styles.studentCard}>
              <div className={styles.heading}>
                <FaUserCircle className={styles.avatarIcon} />
                <div className={styles.studentName}>{student.name}</div>
              </div>

              <div className={styles.infodata}>
                <div className={styles.infoText}>
                  <div className={styles.rollNumber}>
                    <div className={styles.rollNumberImg}>
                      <img src={idcard} alt="ID card" />
                    </div>
                    <div className={styles.rollNumberDetailsDiv}>
                      <div className={styles.label}>Roll Number</div>
                      <div className={styles.rollNumberValue}>
                        {student.rollNumber}
                      </div>
                    </div>
                  </div>

                  <div className={styles.binLabel}>
                    <div className={styles.binLabelImg}>
                      <img src={bin} alt="Bin Icon" />
                    </div>
                    <div className={styles.binLabelDetailsDiv}>
                      <div className={styles.label}>Bin Number</div>
                      <div className={styles.binNumberValue}>
                        {student.binNumber}
                      </div>
                    </div>
                  </div>
                </div>

                <label className={styles.marksInputLabel}>Enter marks:</label>
                <div className={styles.marksInputContainer}>
                  <input type="number" className={styles.marksInput} max={50} />
                  <span className={styles.outOf}>/50</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.remarksContainer}>
          <label className={styles.remarksLabel}>Enter team remarks:</label>
          <textarea
            className={styles.remarksInput}
            maxLength={200}
            placeholder="Type here..."
          />
          <div className={styles.charLimitWarning}>⚠️ 200 Character limit.</div>
        </div>

        <div className={styles.footer}>
          <label className={styles.checkboxContainer}>
            <input type="checkbox" />
            <span>
              I acknowledge that submission triggers deadline initialization for
              evaluators.
            </span>
          </label>

          <button className={styles.submitButton}>Submit</button>
        </div>
      </div>
    </div>
  );
}
