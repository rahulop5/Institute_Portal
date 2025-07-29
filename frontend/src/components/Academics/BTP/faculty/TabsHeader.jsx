import { useState } from 'react';
import styles from '../../../styles/TabsHeader.module.css';
import SearchIcon from '../../../../assets/search.svg';


export default function TabsHeader({ activeTab, setActiveTab }) {

  const [search, setSearch] = useState("");

  return (
    <div className={styles.headerWrapper}>
      <h2 className={styles.heading}>Team Management</h2>

      <div className={styles.tabSearchRow}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tab} ${activeTab === 'topics' ? styles.active : ''}`}
            onClick={() => setActiveTab('topics')}
          >
            Your Topics
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
        </div>

        <div className={styles.searchWrapper}>
           <div className={styles.searchcontainer} id="Teamselectionsearchbar">
                    <input
                      type="text"
                      placeholder="Search by name, email, or roll number"
                      onChange={(e)=>{setSearch(e.target.value)}}
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
