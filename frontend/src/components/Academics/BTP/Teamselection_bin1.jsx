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
    { name: "Abhiram Reddi", roll: "S20230010203", email: "abhiram.r23@iiits.in" },
    { name: "Sahal Ansar Theparambil", roll: "S20230010210", email: "sahal.t23@iiits.in" },
    { name: "Venkat Rahul Vempadapu", roll: "S20230010257", email: "rahul.v23@iiits.in" },
    { name: "Shrushant Reddy", roll: "S20230010208", email: "srushanth.s23@iiits.in" },
    { name: "Pavan Karthik", roll: "S20230010188", email: "karthik.d23@iiits.in" },
    { name: "Balaji Sai Surya", roll: "S20230010209", email: "balajisai.s23@iiits.in" },
    { name: "Abraham Scariya", roll: "S20230020230", email: "abraham.s23@iiits.in" },
    // Add more dummy data if you want to test scrolling
  ].map((student, index) => (
    <div className="student-row" key={index}>
      <div className="student-icon"><img src={studentIcon} alt="" /></div>
        <div className="student-details">
      <div className="student-info">
        <div className="student-name">{student.name}</div>
        <div className="student-meta">
          <span>{student.email}</span>
        </div>
      </div>
      <div>
        <span className="student-roll">{student.roll}</span>
      </div>

        <div className="student-actions">
        <button className="select-button">Select</button>
    </div>
    </div>
    </div>
  ))}
</div>
        </div>



        {/* //Starting with the button and next components */}

        <div className='send-request '>
            <button className="send-request-button active">Send Request</button>
        </div>
        </div>
        </>
    )
}