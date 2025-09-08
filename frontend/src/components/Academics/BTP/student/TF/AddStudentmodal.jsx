import React, { useState } from "react";
import classes from "../../../../styles/AddStudentModal.module.css";
import studentIcon from "../../../../../assets/studenticon.svg";
import { useSubmit, redirect } from "react-router";

export default function AddStudentModal({
  isOpen,
  onClose,
  missingBin,
  studentData,
}) {
  const [selectedStudents, setSelectedStudents] = useState({});
  console.log(selectedStudents);
  const submit = useSubmit();

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
    if (!selectedStudents[missingBin]) return;

    const formData = new FormData();
    formData.append("bin", missingBin);
    formData.append("email", selectedStudents[missingBin].email);
    onClose();

    submit(formData, { method: "post", action: "addteammember" });
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

// inside AddStudentModal.jsx (bottom of file)
export async function action({ request }) {
  const formData = await request.formData();
  const bin = formData.get("bin");
  const email = formData.get("email");

  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:3000/student/btp/addteammember",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bin, email }),
    }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Error adding team member",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();
  console.log("Add team member result:", result);

  return redirect("/academics/btp/student");
}
