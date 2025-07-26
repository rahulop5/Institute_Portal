import BTPStudentList from "./Studentlist";
import classes from "../../../../styles/TeamSelectionbin1.module.css";
import { useState, useEffect } from "react";

export default function TFBin1TeamSelection({
  data,
  selectedBin,
  handlebinchange,
  SearchIcon,
  handleStudentSelect,
  handleSendRequest,
  selectedStudents,
  studentIcon
}) {
  const [search, setSearch]=useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic (delay search by like 300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  return (
    <>
      {/* <h1>Team Formation</h1> */}
      <div className={classes["team-selection-content"]}>
        <div className={classes["team-selection-buttons"]}>
          <h2>Team Selection</h2>
          <div className={classes["team-selection-button-group"]}>
            <button
              className={selectedBin === 2 ? classes["active"] : ""}
              onClick={handlebinchange}
            >
              Bin 2
            </button>
            <button
              className={selectedBin === 3 ? classes["active"] : ""}
              onClick={handlebinchange}
            >
              Bin 3
            </button>
          </div>
        </div>

        <div className="search-container" id="Teamselectionsearchbar">
          <input
            type="text"
            placeholder="Search by name, email, or roll number"
            onChange={(e)=>{setSearch(e.target.value)}}
            value={search}
            className={classes["search-input"]}
            aria-label="Search students"
          />
          <img
            src={SearchIcon}
            alt="Search"
            className={classes["search-icon"]}
          />
        </div>
      </div>

      <BTPStudentList
        bin={selectedBin}
        onSelectStudent={handleStudentSelect}
        selectedStudents={selectedStudents}
        available={selectedBin === 2 ? data?.availablebin2 : data?.availablebin3}
        search={debouncedSearch}
      />

      <div className={classes["added-students"]}>
        <h2>Team Selection Bucket</h2>
        <div className={classes["team-table"]}>
          {Object.entries(selectedStudents).map(([bin, student]) => (
            <div key={student.rollno} className={classes["team-row"]}>
              <div className={classes["student-name-icon"]}>
                <img
                  src={studentIcon}
                  alt="avatar"
                  className={classes["avatar-icon"]}
                />
                <span>{student.name}</span>
              </div>
              <span>{student.rollno}</span>
              <span>{bin}</span>
              <button className={classes["reject-button"]} onClick={()=>{handleStudentSelect(student, parseInt(bin))}} >
                Remove
              </button>
            </div>
          ))}
          {Object.keys(selectedStudents).length === 0 && (
            <div className={classes["team-empty"]}>No students selected.</div>
          )}
        </div>
      </div>
      <button
        className={`${classes["send-request-button"]} ${
          selectedStudents[2] && selectedStudents[3] ? classes["active"] : ""
        }`}
        onClick={handleSendRequest}
      >
        Send Request
      </button>
    </>
  );
}
