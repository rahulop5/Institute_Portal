import BTPStudentList from "./Studentlist";

export default function TFBin1TeamSelection({data, selectedBin, handlebinchange, SearchIcon, handleStudentSelect, handleSendRequest, selectedStudents, studentIcon}){
    return <>
        <h1>Team Formation</h1>
        <div className="team-selection-content">
          <div className="team-selection-buttons">
            <h2>Selection</h2>
            <div className="team-selection-button-group">
              <button
                className={selectedBin === 2 ? 'active' : ''}
                onClick={handlebinchange}
              >
                Bin 2
              </button>
              <button
                className={selectedBin === 3 ? 'active' : ''}
                onClick={handlebinchange}
              >
                Bin 3
              </button>
            </div>
          </div>

          <div className="search-container" id="Teamselectionsearchbar">
            <input type="text" placeholder="Search" className="search-input" />
            <img src={SearchIcon} alt="Search" className="search-icon" />
          </div>
        </div>


          <BTPStudentList
            bin={selectedBin}
            onSelectStudent={handleStudentSelect}
            selectedStudents={selectedStudents}
            available={selectedBin===2?data?.availablebin2:data?.availablebin3}
          />

        <button
          className={`send-request-button ${selectedStudents[2] && selectedStudents[3] ? 'active' : ''}`}
          onClick={handleSendRequest}
        >
          Send Request
        </button>


        <div className="added-students">
          <h1>Team</h1>
          <div className="team-table">
            {Object.entries(selectedStudents).map(([bin, student]) => (
              <div key={student.rollno} className="team-row">
                <div className="student-name-icon">
                  <img src={studentIcon} alt="avatar" className="avatar-icon" />
                  <span>{student.name}</span>
                </div>
                <span>{student.rollno}</span>
                <span>{bin}</span>
              </div>
            ))}
            {Object.keys(selectedStudents).length === 0 && (
              <div className="team-empty">No students selected.</div>
            )}
          </div>
        </div>
    </>
}