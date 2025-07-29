import { useState, useEffect, useMemo } from "react";
import downarrow from "../../../../../assets/right 1.svg";
import profile from "../../../../../assets/studenticon.svg";
import SearchIcon from "../../../../../assets/search.svg";
import classes from "../../../../styles/FacultySelection.module.css";

export default function FacultyList({ topics, onShowTopics }) {
  const [search, setSearch] = useState("");
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

  const filteredTopics = useMemo(() => {
    return topics.filter((entry) =>
      entry.faculty.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [topics, debouncedSearch]);

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
            aria-label="Search students"
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
          <span>Action</span>
        </div>
        <div className={classes["facultyassignment-scrollable-list"]}>
          {filteredTopics.length === 0 ? (
            <div className={classes["facultyassignment-row"]}>
              No faculty match your search.
            </div>
          ) : (
            filteredTopics.map((entry, idx) => (
              <div className={classes["facultyassignment-row"]} key={idx}>
                <div className={classes["facultyassignment-name"]}>
                  <img
                    src={profile}
                    alt="icon"
                    className={classes["facultyassignment-avatar"]}
                  />
                  <span>{entry.faculty.name}</span>
                </div>
                <div>
                  <button
                    className={classes["facultyassignment-link"]}
                    onClick={() => onShowTopics(entry)}
                  >
                    <img src={downarrow} alt="arrow" />
                    View Topics
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
