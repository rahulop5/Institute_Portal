import { useState } from "react";
import warning from "../../../../assets/warning.svg";
import lock from "../../../../assets/padlock.svg";
import styles from "../../../styles/Updatelist.module.css";
import EvaluatorModal from "./EvaluatorModal";

export default function Buttons({ projid, team, isEvaluator }) {
  const [showModal, setShowModal] = useState(false);

  const dummyStudents = [
    {
      _id: "1",
      name: "Rahul Kumar",
      rollNumber: "20BCE001",
      binNumber: "5",
    },
    {
      _id: "2",
      name: "Priya Sharma",
      rollNumber: "20BCE002",
      binNumber: "5",
    },
    {
      _id: "2",
      name: "Priya Sharma",
      rollNumber: "20BCE002",
      binNumber: "5",
    },
  ];

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSubmit = (data) => {
    setShowModal(false);
  };

  return (
    <>
      <div className={styles.actions}>
        <div className={styles.evaluatebutton}>
          <p>
            <img src={warning} alt="Warning" className={styles.icon} />
            Evaluation submission triggers deadline initiation for evaluators.
          </p>
          <button onClick={handleOpenModal}>Evaluate now</button>
        </div>

        <div className={styles.updatebutton}>
          <p>
            <img src={warning} alt="Warning" className={styles.icon} />
            Adding updates operation is irreversible.
          </p>
          <button disabled>
            Add update
            <img src={lock} alt="Lock" className={styles.lockIcon} />
          </button>
        </div>
      </div>

      {showModal && (
        <EvaluatorModal
          isEvaluator={isEvaluator}
          projid={projid}
          students={team.map((student) => ({
            _id: student._id,
            name: student.name,
            rollNumber: student.rollno, // backend sends as "rollno"
            bin: student.bin || "-", // placeholder if not provided
          }))}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
