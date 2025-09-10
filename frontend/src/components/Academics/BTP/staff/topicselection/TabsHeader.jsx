import { useState } from "react";
import styles from "../../../../styles/TabsHeader.module.css";
import SearchIcon from "../../../../../assets/search.svg";

export default function TabsHeader({ activeTab, setActiveTab }) {
  const [search, setSearch] = useState("");

  return (
    <div className={styles.headerWrapper}>
      <h2 className={styles.heading}>Faculty Management</h2>

      <div className={styles.tabSearchRow}>
        {/* Tabs */}
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tab} ${
              activeTab === "facultyTopics" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("facultyTopics")}
          >
            Faculty Topics
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "unassignedTeams" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("unassignedTeams")}
          >
            Unassigned Teams
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchcontainer} id="FacultySearchBar">
            <input
              type="text"
              placeholder="Search by name, email, or roll number"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              className={styles.searchinput}
              aria-label="Search students"
            />
            <img
              src={SearchIcon}
              alt="Search"
              className={styles.searchicon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
