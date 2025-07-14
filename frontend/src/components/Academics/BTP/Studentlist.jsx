import studentIcon from '../../../assets/studenticon.svg';

export default function BTPStudentList({ bin, onSelectStudent, selectedStudents, available }) {

 const parsedBin = Number(bin); // convert if needed

 return (
    <div className="student-list">
      <div className="student-list-scroll">
        {available.map((student, index) => (
          <div className="student-row" key={index}>
            <div className="student-icon">
              <img src={studentIcon} alt="" />
            </div>
            <div className="student-details">
              <div className="student-info">
                <div className="student-name">{student.name}</div>
                <div className="student-meta">{student.email}</div>
              </div>
              <div>
                <span className="student-roll">{student.rollno}</span>
              </div>
              <div className="student-actions">
                <button
                  className="select-button"
                  onClick={() => onSelectStudent(student, parsedBin)}
                  disabled={selectedStudents[bin]?.email === student.email}
                >
                  {selectedStudents[bin]?.rollno === student.rollno ? "Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}