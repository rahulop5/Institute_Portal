import downarrow from "../../../assets/right 1.svg";
import profile from "../../../assets/studenticon.svg";
import Searchcontainer from "./Searchcontainer";

export default function FacultyList({ topics, onShowTopics }) {
  return (
    <div className="facultyassignment-wrapper">
      <h1 className="facultyassignment-title">Topic Selection</h1>
      <div className="facultyassignment-header">
        <h2>Available Faculty</h2>
        <Searchcontainer></Searchcontainer>
      </div>
      <div className="facultyassignment-table-container">
        <div className="facultyassignment-table-header">
          <span>Name</span>
          <span>Action</span>
        </div>
        <div className="facultyassignment-scrollable-list">
          {topics.map((entry, idx) => (
            <div className="facultyassignment-row" key={idx}>
              <div className="facultyassignment-name">
                <img
                  src={profile}
                  alt="icon"
                  className="facultyassignment-avatar"
                />
                <span>{entry.faculty.name}</span>
              </div>
              <div>
                <button
                  className="facultyassignment-link"
                  onClick={() => onShowTopics(entry)}
                >
                  <img src={downarrow} alt="arrow" />
                 View Topics
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
