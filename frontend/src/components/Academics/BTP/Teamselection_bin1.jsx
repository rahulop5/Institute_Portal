import SearchIcon from '../../../assets/search.svg';
import studentIcon from '../../../assets/studenticon.svg';


export default function BTPTeamselection_bin1(){
    return(
        <>
        <div className="team-selection">
        <h1>Team Formation</h1>

        <div className="team-selection-content">
            <div className="team-selection-buttons">
            <h2>Selection</h2>
            <div className="team-selection-button-group">
                <button className="active">Bin 2</button>
                <button>Bin 3</button>
            </div>
           </div>
              <div className="search-container" id='Teamselectionsearchbar'>
             <input type="text" placeholder="Search" className="search-input" />
              <img src={SearchIcon} alt="Search" className="search-icon" />
        </div>
        </div>
        

        <div className='student-list'>
            <div className="student-list-scroll">
        {[
    { name: "Abhiram Reddi", roll: "S20230010203", section: "1" },
    { name: "Sahal Ansar Theparambil", roll: "S20230010210", section: "3" },
    { name: "Venkat Rahul Vempadapu", roll: "S20230010257", section: "2" },
    { name: "Shrushant Reddy", roll: "S20230010208", section: "3" },
    { name: "Pavan Karthik", roll: "S20230010188", section: "1" },
    { name: "Balaji Sai Surya", roll: "S20230010209", section: "3" },
    { name: "Abraham Scariya", roll: "S20230020230", section: "1" },
    // Add more dummy data if you want to test scrolling
  ].map((student, index) => (
    <div className="student-row" key={index}>
      <div className="student-icon"><img src={studentIcon} alt="" /></div>
      <div className="student-info">
        <div className="student-name">{student.name}</div>
        <div className="student-meta">
          <span>{student.roll}</span> | <span>Section {student.section}</span>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>

        </div>
        </>
    )
}