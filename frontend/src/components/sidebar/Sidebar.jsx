import { useState, useRef } from "react";

export default function Sidebar() {
  const [isSidebarClosed, setIsSidebarClosed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const toggleBtnRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarClosed(!isSidebarClosed);
    setOpenDropdown(null); // Close all submenus
  };

  const toggleSubMenu = (index) => {
    if (openDropdown === index) {
      setOpenDropdown(null); // Toggle off if already open
    } else {
      setOpenDropdown(index); // Open selected dropdown
    }

    // If sidebar is closed, open it
    if (isSidebarClosed) {
      setIsSidebarClosed(false);
    }
  };

  return (
    <nav id="sidebar" className={isSidebarClosed ? "close" : ""}>
      <ul>
        <li>
          <span className="logo">coding2go</span>
          <button
            onClick={toggleSidebar}
            id="toggle-btn"
            ref={toggleBtnRef}
            className={isSidebarClosed ? "rotate" : ""}
          >
            {/* Double Arrow Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="m313-480 155 156q11 11 11.5 27.5T468-268q-11 11-28 11t-28-11L228-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T468-692q11 11 11 28t-11 28L313-480Zm264 0 155 156q11 11 11.5 27.5T732-268q-11 11-28 11t-28-11L492-452q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l184-184q11-11 27.5-11.5T732-692q11 11 11 28t-11 28L577-480Z" />
            </svg>
          </button>
        </li>

        <li className="active">
          <a href="index.html">
            {/* Home Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="M240-200h120v-200q0-17 11.5-28.5T400-440h160q17 0 28.5 11.5T600-400v200h120v-360L480-740 240-560v360Z" />
            </svg> */}
            
            <span>Home</span>
          </a>
        </li>

        <li>
          <a href="dashboard.html">
            {/* Dashboard Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="M520-640v-160q0-17 11.5-28.5T560-840h240q17 0 28.5 11.5T840-800v160q0 17-11.5 28.5T800-600H560q-17 0-28.5-11.5T520-640Z" />
            </svg> */}
            <span>Dashboard</span>
          </a>
        </li>

        <li>
          <button
            onClick={() => toggleSubMenu(0)}
            className={`dropdown-btn ${openDropdown === 0 ? "rotate" : ""}`}
          >
            {/* Create Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
            <span>Create</span>
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
          </button>
          <ul className={`sub-menu ${openDropdown === 0 ? "show" : ""}`}>
            <div>
              <li><a href="#">Folder</a></li>
              <li><a href="#">Document</a></li>
              <li><a href="#">Project</a></li>
            </div>
          </ul>
        </li>

        <li>
          <button
            onClick={() => toggleSubMenu(1)}
            className={`dropdown-btn ${openDropdown === 1 ? "rotate" : ""}`}
          >
            {/* Todo Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
            <span>Todo-Lists</span>
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
          </button>
          <ul className={`sub-menu ${openDropdown === 1 ? "show" : ""}`}>
            <div>
              <li><a href="#">Work</a></li>
              <li><a href="#">Private</a></li>
              <li><a href="#">Coding</a></li>
              <li><a href="#">Gardening</a></li>
              <li><a href="#">School</a></li>
            </div>
          </ul>
        </li>

        <li>
          <a href="calendar.html">
            {/* Calendar Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
            <span>Calendar</span>
          </a>
        </li>

        <li>
          <a href="profile.html">
            {/* Profile Icon */}
            {/* <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
              <path d="..." />
            </svg> */}
            <span>Profile</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
