import React, { useEffect, useState } from "react";
import classes from "../styles/BinButtons.module.css";
import StudentList from "./StudentList";

export default function UnallocatedStudents({
  unallocatedData = [],
  isSelectMode = false,
  onSelectStudent = () => {},
  allowedBin, // optional: when present, bin filter is locked to this bin
}) {
  const initialBin = allowedBin ?? 1;
  const [selectedBin, setSelectedBin] = useState(initialBin);

  // If allowedBin changes (or provided), keep the UI in sync
  useEffect(() => {
    if (allowedBin) setSelectedBin(allowedBin);
  }, [allowedBin]);

  const handleBinChange = (bin) => {
    if (allowedBin && bin !== allowedBin) return; // lock bins in replace dialog
    setSelectedBin(bin);
  };

  const filteredStudents = unallocatedData.filter(
    (student) => student.bin.id === selectedBin
  );

  return (
    <div>
      <div className={classes["team-selection-buttons"]}>
        <div className={classes["team-selection-button-group"]}>
          {[1, 2, 3].map((bin) => (
            <button
              key={bin}
              className={selectedBin === bin ? classes["active"] : ""}
              onClick={() => handleBinChange(bin)}
              disabled={!!allowedBin && bin !== allowedBin}
              type="button"
            >
              {`Bin ${bin}`}
            </button>
          ))}
        </div>
      </div>

      <StudentList
        isSelectMode={isSelectMode}
        onSelect={onSelectStudent}
        students={filteredStudents.map((item) => ({
          name: item.student.name,
          rollno: item.student.roll,
          email: `${item.student.roll}@example.com`,
          // Keep original object so confirm can send full shape back up
          __raw: item,
        }))}
      />
    </div>
  );
}
