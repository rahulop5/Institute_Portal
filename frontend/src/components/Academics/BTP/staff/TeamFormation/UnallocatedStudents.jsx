import React, { useState } from "react";
import classes from "../styles/BinButtons.module.css";
import StudentList from "./StudentList";

export default function UnallocatedStudents({ unallocatedData }) {
  const [selectedBin, setSelectedBin] = useState(1);

  const handleBinChange = (bin) => {
    setSelectedBin(bin);
  };


  const filteredStudents = unallocatedData.filter(
    (student) => student.bin.id === selectedBin
  );

  return (
    <div>
      <div className={classes["team-selection-buttons"]}>
        <div className={classes["team-selection-button-group"]}>
          <button
            className={selectedBin === 1 ? classes["active"] : ""}
            onClick={() => handleBinChange(1)}
          >
            Bin 1
          </button>
          <button
            className={selectedBin === 2 ? classes["active"] : ""}
            onClick={() => handleBinChange(2)}
          >
            Bin 2
          </button>
          <button
            className={selectedBin === 3 ? classes["active"] : ""}
            onClick={() => handleBinChange(3)}
          >
            Bin 3
          </button>
        </div>
      </div>

      <StudentList
        students={filteredStudents.map((item) => ({
          name: item.student.name,
          rollno: item.student.roll,
          email: `${item.student.roll}@example.com`, 
        }))}
      />
    </div>
  );
}
