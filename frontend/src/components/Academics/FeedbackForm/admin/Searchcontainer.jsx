// In SearchContainer.jsx
import React, { useState, useEffect } from "react";
import SearchIcon from "../../../../assets/search.svg";
import classes from "../styles/SearchContainer.module.css";

// 1. Renamed component and added 'placeholder' prop
export default function SearchContainer({ onSearchChange, placeholder }) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search, onSearchChange]);

  return (
    <div className={classes["search-container"]} id="Teamselectionsearchbar">
      <input
        type="text"
        // 2. Use the placeholder prop (with a default)
        placeholder={placeholder || "Search..."}
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        className={classes["search-input"]}
        aria-label="Search"
      />
      <img
        src={SearchIcon}
        alt="Search"
        className={classes["search-icon"]}
      />
    </div>
  );
}