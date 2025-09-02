import { useState, useEffect, useMemo } from "react";
import downarrow from "../../../../../assets/right 1.svg";
import profile from "../../../../../assets/studenticon.svg";
import SearchIcon from "../../../../../assets/search.svg";
import classes from "../../../../styles/FacultySelection.module.css";

export default function FacultyList({ faculties, onShowTopics,topics }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

 
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredFaculties = useMemo(() => {
    return faculties.filter((entry) =>
      entry.faculty.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [faculties, debouncedSearch]);

  return (
    <div className={classes["facultyassignment-wrapper"]}>
      <div className={classes["facultyassignment-header"]}>
        <h2>Available Faculty</h2>
        <div
          className={classes["search-container"]}
          id="Teamselectionsearchbar"
        >
          <input
            type="text"
            placeholder="Search by Faculty name"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className={classes["search-input"]}
            aria-label="Search faculty"
          />
          <img
            src={SearchIcon}
            alt="Search"
            className={classes["search-icon"]}
          />
        </div>
      </div>

      <div className={classes["facultyassignment-table-container"]}>
        <div className={classes["facultyassignment-table-header"]}>
          <span>Name</span>
          <span>Topics Uploaded</span>
        </div>

        <div className={classes["facultyassignment-scrollable-list"]}>
          {filteredFaculties.length === 0 ? (
            <div className={classes["facultyassignment-row"]}>
              No faculty match your search.
            </div>
          ) : (
            filteredFaculties.map((entry, idx) => {
              const uploaded =
                typeof entry?.faculty?.topicsUploaded === "number"
                  ? entry.faculty.topicsUploaded
                  : Array.isArray(entry?.topics)
                  ? entry.topics.length
                  : 0;

              return (
                <div className={classes["facultyassignment-row"]} key={idx}>
                  {/* Faculty Profile & Name */}
                  <div className={classes["facultyassignment-name"]}>
                    <img
                      src={profile}
                      alt="icon"
                      className={classes["facultyassignment-avatar"]}
                    />
                    <span>{entry.faculty.name}</span>
                  </div>

                  {/* Topics Uploaded */}
                  <div className={classes["facultyassignment-uploaded"]}>
                    <span>{uploaded}</span>
                  </div>

                  {/* View Topics Button */}
                  <div className={classes["facultyassignment-action"]}>
                    <button
                      className={classes["facultyassignment-link"]}
                      onClick={() => onShowTopics(entry)}
                    >
                      <img
                        src={downarrow}
                        alt="arrow"
                        className={classes["facultyassignment-icon"]}
                      />
                      <div>View Topics</div>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
