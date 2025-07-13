export default function Header(){
  return(
    <>
    <div className="header">
      <div className="logo">
      <img src="/icons/college_logo.svg" alt="College logo"/>
    <div>
      <h3>Indian Institute of Information <br/>Technology, Sri City <br />भारतीय सूचना प्रौद्योगिकी संस्थान श्री सिटी</h3>
    </div>
      </div> 
       <div className="search-container">
      <input type="text" placeholder="Search" className="search-input" />
       <img src="/icons/search.svg" alt="Search" className="search-icon" />
        </div>


     <div className="header-right">
  <button className="icon-button">
    <img src="icons/notification.png" alt="notifications" />
  </button>

  <div className="greeting">
    <h3>Hello, Sai Tej <br />Have a great day!</h3>
  </div>

  <button className="icon-button profile-button">
    <img src="icons/profile.svg" alt="Profile" />
  </button>
</div>

    </div>
    </>
  )
}