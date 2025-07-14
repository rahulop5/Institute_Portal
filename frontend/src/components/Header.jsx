import CollegeIcon from "./../assets/college_logo.svg";
import SearchIcon from "./../assets/search.svg";
import notificationIcon from "./../assets/notification.png";
import profileIcon from "./../assets/profile.svg";

export default function Header(){
  const name=localStorage.getItem("name");

  return(
    <>
      <div className="header">
        <div className="logo">
        <img src={CollegeIcon} alt="College logo"/>
      <div>
        <h3>Indian Institute of Information <br/>Technology, Sri City <br />भारतीय सूचना प्रौद्योगिकी संस्थान श्री सिटी</h3>
      </div>
        </div> 
         <div className="search-container">
        <input type="text" placeholder="Search" className="search-input" />
         <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>


       <div className="header-right">
          <button className="icon-button">
            <img src={notificationIcon} alt="notifications" />
          </button>

          <div className="greeting">
            <h3>Hello, {name?name:"noname"} <br />Have a great day!</h3>
          </div>

          <button className="icon-button profile-button">
            <img src={profileIcon} alt="Profile" />
          </button>
        </div>

      </div>
    </>
  )
}