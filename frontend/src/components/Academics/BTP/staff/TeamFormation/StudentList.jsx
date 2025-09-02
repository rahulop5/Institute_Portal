import React from "react";
import studentIcon from "../../../../../assets/studenticon.svg";
import classes from "../styles/StudentLits.module.css"; 

const StudentList = ({ students = [], isSelectMode = false, onSelect }) => {
  return (
    <div className={classes["student-list"]}>
      {/* Header */}
      <div className={classes["student-header"]}>
        <div className={classes["header-name"]}>Name</div>
        <div className={classes["header-roll"]}>Roll Number</div>
        {isSelectMode && <div className={classes["header-action"]}>Action</div>}
      </div>

    
      <div className={classes["student-list-scroll"]}>
        {students.length === 0 ? (
          <div className={classes["empty-message"]}>No students available</div>
        ) : (
          students.map((student) => (
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
                  <div className={classes["student-roll"]}>
                    {student.roll}
                  </div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default StudentList;
