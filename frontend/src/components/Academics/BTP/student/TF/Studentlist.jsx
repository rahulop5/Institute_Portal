import studentIcon from '../../../../../assets/studenticon.svg';
import classes from "../../../../styles/TeamSelectionbin1.module.css";
import { useMemo } from 'react';

export default function BTPStudentList({ bin, onSelectStudent, selectedStudents, available, search }) {

  const parsedBin = Number(bin);
  const searchLower = search.toLowerCase();

  const filteredStudents = useMemo(() => {
    return available.filter((stu) => {
      return [stu.name, stu.email, stu.rollno].some(field =>
        field.toLowerCase().includes(searchLower)
      );
    });
  }, [available, searchLower]);

  return (
    <div className={classes["student-list"]}>
      <div className={classes["student-list-scroll"]}>
        {/* basic search logic here */}
        {filteredStudents.length === 0 ? (
          <div className={classes["no-results"]}>No students match your search.</div>
        ) : (
          filteredStudents.map((student) => {
            const isSelected = selectedStudents[parsedBin]?.email === student.email;
            return (
              <div className={classes["student-row"]} key={student.rollno}>
                <div className={classes["student-icon"]}>
                  <img src={studentIcon} alt="" />
                </div>
                <div className={classes["student-details"]}>
                  <div className={classes["student-info"]}>
                    <div className={classes["student-name"]}>{student.name}</div>
                    <div className={classes["student-meta"]}>{student.email}</div>
                  </div>
                  <div className={classes["student-roll"]}>
                    {student.rollno}
                  </div>
                  <div className={classes["student-actions"]}>
                    <button
                      className={classes["select-button"]}
                      onClick={() => onSelectStudent(student, parsedBin)}
                      aria-label={`Select student ${student.name}`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
