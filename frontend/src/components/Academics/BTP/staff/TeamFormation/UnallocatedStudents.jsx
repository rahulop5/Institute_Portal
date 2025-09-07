import React, { useState } from "react";
import classes from "../styles/BinButtons.module.css";
import StudentList from "./StudentList";

export default function UnallocatedStudents({
  unallocatedData = [],
  isSelectMode = false,
  onSelect,
  selectedStudent,
}) {
  const [selectedBin, setSelectedBin] = useState(1);

  const filteredStudents = (unallocatedData || [])
    .filter((member) => (member.bin && member.bin.id ? member.bin.id : member.bin) === selectedBin)
    .map((member) => ({
      name: member.student?.name || member.student,
      rollno: member.student?.roll || "",
      email: member.email || member.student?.email || "",
      __raw: member, // original object - pass back on select
    }));

  return (
    <div>
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

      <StudentList
        students={filteredStudents}
        isSelectMode={isSelectMode}
        onSelect={onSelect}
        selectedStudent={selectedStudent}
      />
    </div>
  );
}
