import React, { useState, useEffect, useMemo } from "react";
import SearchIcon from "../../../../../assets/search.svg"; // Update the path
import classes from "../styles/Searchcontainer.module.css"; // Update with your CSS module

export default function FacultySearch({ topics }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce logic (delay search by 300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Filtered topics based on faculty name
  const filteredTopics = useMemo(() => {
    return topics.filter((entry) =>
      entry.faculty.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [topics, debouncedSearch]);

  return (
    <div>
      {/* Search Bar */}
      <div className={classes["search-container"]} id="Teamselectionsearchbar">
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

      {/* Filtered Results */}
      <ul className={classes["results-list"]}>
        {filteredTopics.length > 0 ? (
          filteredTopics.map((item, index) => (
            <li key={index} className={classes["result-item"]}>
              {item.faculty.name}
            </li>
          ))
        ) : (
          <li className={classes["no-results"]}>No results found</li>
        )}
      </ul>
    </div>
  );
}
