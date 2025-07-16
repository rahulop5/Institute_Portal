import CollegeIcon from "./../assets/college_logo.svg";
import SearchIcon from "./../assets/search.svg";
import notificationIcon from "./../assets/notification.png";
import profileIcon from "./../assets/profile.svg";
import classes from "./styles/Header.module.css";

export default function Header() {
  const name = localStorage.getItem("name");

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

          <button className={`${classes["icon-button"]} ${classes["profile-button"]}`}>
            <img src={profileIcon} alt="Profile" />
          </button>
        </div>
      </div>
    </>
  );
}
