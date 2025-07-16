import studentIcon from '../../../assets/studenticon.svg';
import classes from "../../styles/TeamSelectionbin1.module.css";

export default function BTPStudentList({ bin, onSelectStudent, selectedStudents, available }) {

  const parsedBin = Number(bin);

  return (
    <div className={classes["student-list"]}>
      <div className={classes["student-list-scroll"]}>
        {available.map((student, index) => (
          <div className={classes["student-row"]} key={index}>
            <div className={classes["student-icon"]}>
              <img src={studentIcon} alt="" />
            </div>
            <div className={classes["student-details"]}>
              <div className={classes["student-info"]}>
                <div className={classes["student-name"]}>{student.name}</div>
                <div className={classes["student-meta"]}>{student.email}</div>
              </div>
              <div>
                <span className={classes["student-roll"]}>{student.rollno}</span>
              </div>
              <div className={classes["student-actions"]}>
                <button
                  className={classes["select-button"]}
                  onClick={() => onSelectStudent(student, parsedBin)}
                  disabled={selectedStudents[bin]?.email === student.email}
                >
                  {selectedStudents[bin]?.rollno === student.rollno ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
