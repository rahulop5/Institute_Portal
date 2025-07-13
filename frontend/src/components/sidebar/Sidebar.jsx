import { useState, useRef } from "react";

// Image imports
import peopleIcon from "../../assets/people.png";
import settingsIcon from "../../assets/settings.svg";
import studentIcon from "../../assets/student.svg";
import staffIcon from "../../assets/staff.svg";
import facultyIcon from "../../assets/facukty.svg";
import honorsIcon from "../../assets/person-rays.svg";
import btpIcon from "../../assets/BTP.svg";
import feedbackIcon from "../../assets/feedback-cycle-loop 1.svg";
import academicsIcon from "../../assets/book-open-cover 1.svg";
import homeIcon from "../../assets/home 2.svg";
import arrow from "../../assets/arrow.svg";

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
      setOpenDropdown(null);
    } else {
      setOpenDropdown(index);
    }

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
            <img src={homeIcon} alt="People Icon" height="24" width="24" />
            <span>Home</span>
          </a>
        </li>

        {/* Academics Menu */}
        <li>
          <button
            onClick={() => toggleSubMenu(0)}
            className={`dropdown-btn ${openDropdown === 0 ? "rotate" : ""}`}
          > 
          <img src={academicsIcon} alt="People Icon" height="24" width="24" />
            <span>Academics</span>
             <img src={arrow} alt="Honors" height="20" width="20" />
              
          </button>
          <ul className={`sub-menu ${openDropdown === 0 ? "show" : ""}`}>
            <div>
              <li>
                <a href="#">
                  <img src={honorsIcon} alt="Honors" height="20" width="20" />
                  <span>Honors</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <img src={btpIcon} alt="BTP" height="20" width="20" />
                  <span>BTP</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <img src={feedbackIcon} alt="Feedback Form" height="20" width="20" />
                  <span>Feedback Form</span>
                </a>
              </li>
            </div>
          </ul>
        </li>

        {/* People Menu */}
        <li>
          <button
            onClick={() => toggleSubMenu(1)}
            className={`dropdown-btn ${openDropdown === 1 ? "rotate" : ""}`}
          >
            <img src={peopleIcon} alt="People Icon" height="24" width="24" />
            <span>People</span>
          </button>
          <ul className={`sub-menu ${openDropdown === 1 ? "show" : ""}`}>
            <div>
              <li>
                <a href="#">
                  <img src={studentIcon} alt="Student" height="20" width="20" />
                  <span>Student</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <img src={staffIcon} alt="Staff" height="20" width="20" />
                  <span>Staff</span>
                </a>
              </li>
              <li>
                <a href="#">
                  <img src={facultyIcon} alt="Faculty" height="20" width="20" />
                  <span>Faculty</span>
                </a>
              </li>
            </div>
          </ul>
        </li>

        {/* Settings */}
        <li>
          <a href="profile.html">
            <img src={settingsIcon} alt="Settings Icon" height="24" width="24" />
            <span>Settings</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
