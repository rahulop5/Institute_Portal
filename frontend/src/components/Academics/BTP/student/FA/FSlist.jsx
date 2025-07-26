import { useState, useEffect, useMemo } from "react";
import downarrow from "../../../../../assets/right 1.svg";
import profile from "../../../../../assets/studenticon.svg";
import SearchIcon from "../../../../../assets/search.svg";

export default function FacultyList({ topics, onShowTopics }) {
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

  const filteredTopics = useMemo(() => {
    return topics.filter((entry) =>
      entry.faculty.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [topics, debouncedSearch]);


  return (
    <div className="facultyassignment-wrapper">
      <div className="facultyassignment-header">
        <h2>Available Faculty</h2>
        <div className="search-container" id="Teamselectionsearchbar">
          <input
            type="text"
            placeholder="Search by Faculty name"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="search-input"
            aria-label="Search students"
          />
          <img src={SearchIcon} alt="Search" className="search-icon" />
        </div>
      </div>

      <div className="facultyassignment-table-container">
        <div className="facultyassignment-table-header">
          <span>Name</span>
          <span>Action</span>
        </div>
        <div className="facultyassignment-scrollable-list">
          {filteredTopics.length === 0 ? (
            <div className="facultyassignment-row">No faculty match your search.</div>
          ) : (
            filteredTopics.map((entry, idx) => (
              <div className="facultyassignment-row" key={idx}>
                <div className="facultyassignment-name">
                  <img
                    src={profile}
                    alt="icon"
                    className="facultyassignment-avatar"
                  />
                  <span>{entry.faculty.name}</span>
                </div>
                <div>
                  <button
                    className="facultyassignment-link"
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
