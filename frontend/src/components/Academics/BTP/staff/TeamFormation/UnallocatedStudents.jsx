import React, { useState } from "react";
import classes from "../styles/BinButtons.module.css"; // CSS with .team-selection-buttons etc.
import StudentList from "./StudentList";

export default function UnallocatedStudents({ unallocatedData, isSelectMode }) {
  const [selectedBin, setSelectedBin] = useState(1);

  const filteredStudents = unallocatedData
    .filter((member) => member.bin.id === selectedBin)
    .map((member) => ({
      name: member.student.name,
      rollno: member.student.roll,
      email: member.email,
      __raw: member, // Keeping original for actions
    }));

  return (
    <div>
      {/* Bin Selection Buttons */}
      <div className={classes["team-selection-buttons"]}>
        <h2>Unallocated Students</h2>
        <div className={classes["team-selection-button-group"]}>
          {[1, 2, 3].map((bin) => (
            <button
              key={bin}
              className={`${selectedBin === bin ? classes.active : ""}`}
              onClick={() => setSelectedBin(bin)}
            >
              Bin {bin}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <StudentList students={filteredStudents} isSelectMode={isSelectMode} />
    </div>
  );
}
