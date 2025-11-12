import { useState } from "react"; 
import CollegeIcon from "./../assets/college_logo.svg";
import SearchIcon from "./../assets/search.svg";
import notificationIcon from "./../assets/notification.png";
import profileIcon from "./../assets/profile.svg";
import classes from "./styles/Header.module.css";
import ProfileDropdown from "./ProfileDropDown"; 

export default function Header() {
  const name = localStorage.getItem("name");
  // 3. Add state for dropdown visibility
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  return (
    <>
      <div className={classes["header"]}>
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

          {/* 4. Wrap the button in a div to manage hover state */}
          <div
            className={classes["profile-container"]}
            onMouseEnter={() => setDropdownVisible(true)}
            onMouseLeave={() => setDropdownVisible(false)}
          >
            <button className={`${classes["icon-button"]} ${classes["profile-button"]}`}>
              <img src={profileIcon} alt="Profile" />
            </button>

            {/* 5. Conditionally render the dropdown */}
            {isDropdownVisible && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </>
  );
}