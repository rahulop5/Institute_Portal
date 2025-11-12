// 1. Import useState AND useRef
import { useState, useRef } from "react"; 
import CollegeIcon from "./../assets/college_logo.svg";
import SearchIcon from "./../assets/search.svg";
import notificationIcon from "./../assets/notification.png";
import profileIcon from "./../assets/profile.svg";
import classes from "./styles/Header.module.css";
import ProfileDropdown from "./ProfileDropdown.jsx";

export default function Header() {
  const name = localStorage.getItem("name");
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  
  // 2. Create a ref to store the timer ID
  const closeTimer = useRef(null);

  // 3. Create a handler for mouse enter
  const handleMouseEnter = () => {
    // If there's a pending timer to close, cancel it
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
    // Show the dropdown
    setDropdownVisible(true);
  };

  // 4. Create a handler for mouse leave
  const handleMouseLeave = () => {
    // Set a timer to close the dropdown after 300ms
    closeTimer.current = setTimeout(() => {
      setDropdownVisible(false);
    }, 300); // 300ms grace period
  };

  return (
    <>
      <div className={classes["header"]}>
        {/* ... your logo and search code ... */}
        <div className={classes["logo"]}>
          <img src={CollegeIcon} alt="College logo" />
          <div>
            <h3>
              Indian Institute of Information <br />
              Technology, Sri City <br />
              भारतीय सूचना प्रौद्योगिकी संस्थान श्री सिटी
            </h3>
          </div>
        </div>

        <div className={classes["search-container"]}>
          <input
            type="text"
            placeholder="Search"
            className={classes["search-input"]}
          />
          <img src={SearchIcon} alt="Search" className={classes["search-icon"]} />
        </div>

        <div className={classes["header-right"]}>
          <button className={classes["icon-button"]}>
            <img src={notificationIcon} alt="notifications" />
          </button>

          <div className={classes["greeting"]}>
            <h3>Hello, {name ? name : "noname"} <br />Have a great day!</h3>
          </div>

          {/* 5. Apply the new handlers to the container */}
          <div
            className={classes["profile-container"]}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className={`${classes["icon-button"]} ${classes["profile-button"]}`}>
              <img src={profileIcon} alt="Profile" />
            </button>

            {isDropdownVisible && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </>
  );
}