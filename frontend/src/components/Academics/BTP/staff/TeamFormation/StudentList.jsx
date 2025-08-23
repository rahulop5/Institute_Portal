import React from "react";
import studentIcon from "../../../../../assets/studenticon.svg";
import classes from "../styles/StudentLits.module.css"; // (your original filename)

const StudentList = ({ students, isSelectMode = false, onSelect = () => {} }) => {
  return (
    <div>
      <div className={classes["student-list"]}>
        <div className={classes["student-header"]}>
          <div className={classes["header-name"]}>Name</div>
          <div className={classes["header-roll"]}>Roll Number</div>
          {isSelectMode && <div className={classes["header-action"]}>Action</div>}
        </div>

        <div className={classes["student-list-scroll"]}>
          {students.map((student) => (
            <div className={classes["student-row"]} key={student.rollno}>
              <div className={classes["student-icon"]}>
                <img src={studentIcon} alt="Student Icon" />
              </div>

              <div className={classes["student-details"]}>
                <div className={classes["student-info"]}>
                  <div className={classes["student-name"]}>{student.name}</div>
                  <div className={classes["student-meta"]}>{student.email}</div>
                </div>

                <div className={classes["rollselect"]}>
                  <div className={classes["student-roll"]}>{student.rollno}</div>
                </div>

                {isSelectMode && (
                  <div className={classes["action-cell"]}>
                    <button
                      className={classes["select-button"]}
                      onClick={() => onSelect(student.__raw)}
                      type="button"
                    >
                      Select
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
