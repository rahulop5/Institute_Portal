import React, { useState } from "react";
import classes from "../../../../styles/AddStudentModal.module.css";
import studentIcon from "../../../../../assets/studenticon.svg";

const studentData = {
  name: "Krishna Anika",
  email: "krishna.anika19@example.com",
  phase: "TF",
  inteam: 0,
  bin: 1,
  message: "You are currently not in any full or partial team. Form a team",
  availablebin2: [
    {
      name: "Ayaan Pari",
      rollno: "S20211022",
      email: "ayaan.pari22@example.com",
    },
    { name: "Dev Yash", rollno: "S20211036", email: "dev.yash36@example.com" },
    {
      name: "Saanvi Anaya",
      rollno: "S20211037",
      email: "saanvi.anaya37@example.com",
    },
  ],
  availablebin3: [
    {
      name: "Divya Anika",
      rollno: "S20211045",
      email: "divya.anika45@example.com",
    },
    { name: "Neha Dev", rollno: "S20211046", email: "neha.dev46@example.com" },
    {
      name: "Anika Ira",
      rollno: "S20211049",
      email: "anika.ira49@example.com",
    },
  ],
};

export default function AddStudentModal({ isOpen, onClose, missingBin }) {
  const [selectedStudents, setSelectedStudents] = useState({});

  if (!isOpen) return null;

  const binKey = missingBin === 2 ? "availablebin2" : "availablebin3";
  const students = studentData?.[binKey] || [];

  const handleStudentSelect = (student, bin) => {
    setSelectedStudents((prev) => {
      // if already selected → remove
      if (prev[bin]?.rollno === student.rollno) {
        const updated = { ...prev };
        delete updated[bin];
        return updated;
      }
      // otherwise add new student for that bin
      return { ...prev, [bin]: student };
    });
  };

  const handleSendRequest = () => {
    console.log("Sending request with:", selectedStudents);
    onClose();
  };

  return (
    <div className={classes.overlay}>
      <div className={classes.modal}>
        {/* Header */}
        <div className={classes.header}>
          <h2>Select Bin {missingBin} Student</h2>
          <button onClick={onClose} className={classes.closeBtn}>
            ✕
          </button>
        </div>

        {/* Table Header */}
        <div className={classes.studentTable}>
          <div className={classes.studentHeader}>
            <div className={classes.headerName}>Name</div>
            <div className={classes.headerRoll}>Roll Number</div>
            <div className={classes.headerAction}>Action</div>
          </div>

          {/* Scrollable student list */}
          <div className={classes.studentListScroll}>
            {students.length === 0 ? (
              <div className={classes.emptyMessage}>No students available</div>
            ) : (
              students.map((s) => {
                const isSelected =
                  selectedStudents[missingBin]?.rollno === s.rollno;
                return (
                  <div key={s.email} className={classes.studentRow}>
                    <div className={classes.studentIcon}>
                      <img src={studentIcon} alt="Student Icon" />
                    </div>

                    <div className={classes.studentDetails}>
                      <div className={classes.studentInfo}>
                        <div className={classes.studentName}>{s.name}</div>
                        <div className={classes.studentMeta}>{s.email}</div>
                      </div>

                      <div className={classes.rollSelect}>
                        <div className={classes.studentRoll}>{s.rollno}</div>
                      </div>

                      <div className={classes.actionCell}>
                        <button
                          className={
                            isSelected
                              ? classes.removeButtonInline
                              : classes.selectButton
                          }
                          onClick={() => handleStudentSelect(s, missingBin)}
                          type="button"
                        >
                          {isSelected ? "Remove" : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* ✅ Selection Bucket */}
        <div className={classes["added-students"]}>
          <h2>Selection Bucket</h2>

          <div
            className={`${classes["team-table"]} ${
              Object.keys(selectedStudents).length > 0 ? classes.active : ""
            }`}
          >
            {Object.entries(selectedStudents).map(([bin, student]) => (
              <div key={student.rollno} className={classes["team-row"]}>
                <div className={classes["student-name-icon"]}>
                  <img
                    src={studentIcon}
                    alt="avatar"
                    className={classes["avatar-icon"]}
                  />
                  <div className={classes["student-name"]}>{student.name}</div>
                </div>
                <div className={classes["team-info"]}>
                  <div>{student.rollno}</div>
                  {/* <div>{bin}</div> */}
                  <div>
                    <button
                      className={classes["remove-button"]}
                      onClick={() =>
                        handleStudentSelect(student, parseInt(bin))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(selectedStudents).length === 0 && (
              <div className={classes["team-empty"]}>No students selected.</div>
            )}
          </div>
        </div>

        <button
          className={`${classes["send-request-button"]} ${
            selectedStudents[missingBin] ? classes["active"] : ""
          }`}
          onClick={handleSendRequest}
          disabled={!selectedStudents[missingBin]}
        >
          Send Request
        </button>
      </div>
    </div>
  );
}
