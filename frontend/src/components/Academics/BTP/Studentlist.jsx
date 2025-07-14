import studentIcon from '../../../assets/studenticon.svg';

export default function BTPStudentList({ bin, onSelectStudent, selectedStudents }) {


    const students = [
      {
    "name": "Krishna Anika",
    "email": "krishna.anika19@example.com",
    "dept": "CSE",
    "rollno": "S20211019",
    "phone": "9876527698",
    "ug": "3",
    "section": "3",
    "bin": 2,
    "isBTP": true
  },
  {
    "name": "Pari Dev",
    "email": "pari.dev20@example.com",
    "dept": "CSE",
    "rollno": "S20211020",
    "phone": "9876511499",
    "ug": "2",
    "section": "1",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Vivaan Sneha",
    "email": "vivaan.sneha21@example.com",
    "dept": "CSE",
    "rollno": "S20211021",
    "phone": "9876532818",
    "ug": "3",
    "section": "1",
    "bin": 1,
    "isBTP": true
  },
  {
    "name": "Ayaan Pari",
    "email": "ayaan.pari22@example.com",
    "dept": "CSE",
    "rollno": "S20211022",
    "phone": "9876511463",
    "ug": "3",
    "section": "1",
    "bin": 1,
    "isBTP": true
  },
  {
    "name": "Diya Aditya",
    "email": "diya.aditya23@example.com",
    "dept": "CSE",
    "rollno": "S20211023",
    "phone": "9876541277",
    "ug": "2",
    "section": "1",
    "bin": 2,
    "isBTP": false
  },
  {
    "name": "Yash Priya",
    "email": "yash.priya24@example.com",
    "dept": "CSE",
    "rollno": "S20211024",
    "phone": "9876571780",
    "ug": "3",
    "section": "2",
    "bin": 3,
    "isBTP": true
  },
  {
    "name": "Vihaan Sneha",
    "email": "vihaan.sneha25@example.com",
    "dept": "CSE",
    "rollno": "S20211025",
    "phone": "9876514851",
    "ug": "2",
    "section": "2",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Sai Kunal",
    "email": "sai.kunal26@example.com",
    "dept": "CSE",
    "rollno": "S20211026",
    "phone": "9876592278",
    "ug": "2",
    "section": "3",
    "bin": 2,
    "isBTP": false
  },
  {
    "name": "Ayaan Meera",
    "email": "ayaan.meera27@example.com",
    "dept": "CSE",
    "rollno": "S20211027",
    "phone": "9876529255",
    "ug": "3",
    "section": "2",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Kabir Neha",
    "email": "kabir.neha28@example.com",
    "dept": "CSE",
    "rollno": "S20211028",
    "phone": "9876540642",
    "ug": "3",
    "section": "3",
    "bin": 2,
    "isBTP": true
  },
  {
    "name": "Yash Kunal",
    "email": "yash.kunal29@example.com",
    "dept": "CSE",
    "rollno": "S20211029",
    "phone": "9876516295",
    "ug": "3",
    "section": "3",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Ayaan Krishna",
    "email": "ayaan.krishna30@example.com",
    "dept": "CSE",
    "rollno": "S20211030",
    "phone": "9876592662",
    "ug": "3",
    "section": "2",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Reyansh Sai",
    "email": "reyansh.sai31@example.com",
    "dept": "CSE",
    "rollno": "S20211031",
    "phone": "9876548158",
    "ug": "2",
    "section": "3",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Sneha Vihaan",
    "email": "sneha.vihaan32@example.com",
    "dept": "CSE",
    "rollno": "S20211032",
    "phone": "9876582624",
    "ug": "2",
    "section": "2",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Meera Ira",
    "email": "meera.ira33@example.com",
    "dept": "CSE",
    "rollno": "S20211033",
    "phone": "9876592919",
    "ug": "2",
    "section": "1",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Anika Sneha",
    "email": "anika.sneha34@example.com",
    "dept": "CSE",
    "rollno": "S20211034",
    "phone": "9876593602",
    "ug": "2",
    "section": "2",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Kunal Vihaan",
    "email": "kunal.vihaan35@example.com",
    "dept": "CSE",
    "rollno": "S20211035",
    "phone": "9876547733",
    "ug": "2",
    "section": "2",
    "bin": 2,
    "isBTP": false
  },
  {
    "name": "Dev Yash",
    "email": "dev.yash36@example.com",
    "dept": "CSE",
    "rollno": "S20211036",
    "phone": "9876517485",
    "ug": "3",
    "section": "1",
    "bin": 3,
    "isBTP": true
  },
  {
    "name": "Saanvi Anaya",
    "email": "saanvi.anaya37@example.com",
    "dept": "CSE",
    "rollno": "S20211037",
    "phone": "9876530490",
    "ug": "3",
    "section": "3",
    "bin": 1,
    "isBTP": true
  },
  {
    "name": "Diya Sai",
    "email": "diya.sai38@example.com",
    "dept": "CSE",
    "rollno": "S20211038",
    "phone": "9876520070",
    "ug": "3",
    "section": "1",
    "bin": 2,
    "isBTP": true
  },
  {
    "name": "Anika Sara",
    "email": "anika.sara39@example.com",
    "dept": "CSE",
    "rollno": "S20211039",
    "phone": "9876576406",
    "ug": "2",
    "section": "3",
    "bin": 1,
    "isBTP": false
  },
  {
    "name": "Kabir Aarav",
    "email": "kabir.aarav40@example.com",
    "dept": "CSE",
    "rollno": "S20211040",
    "phone": "9876593975",
    "ug": "2",
    "section": "3",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Vihaan Aarav",
    "email": "vihaan.aarav41@example.com",
    "dept": "CSE",
    "rollno": "S20211041",
    "phone": "9876534130",
    "ug": "3",
    "section": "2",
    "bin": 1,
    "isBTP": true
  },
  {
    "name": "Priya Reyansh",
    "email": "priya.reyansh42@example.com",
    "dept": "CSE",
    "rollno": "S20211042",
    "phone": "9876546957",
    "ug": "2",
    "section": "1",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Meera Ira",
    "email": "meera.ira43@example.com",
    "dept": "CSE",
    "rollno": "S20211043",
    "phone": "9876588730",
    "ug": "3",
    "section": "3",
    "bin": 3,
    "isBTP": true
  },
  {
    "name": "Ira Anika",
    "email": "ira.anika44@example.com",
    "dept": "CSE",
    "rollno": "S20211044",
    "phone": "9876549641",
    "ug": "2",
    "section": "2",
    "bin": 3,
    "isBTP": false
  },
  {
    "name": "Divya Anika",
    "email": "divya.anika45@example.com",
    "dept": "CSE",
    "rollno": "S20211045",
    "phone": "9876567389",
    "ug": "3",
    "section": "3",
    "bin": 3,
    "isBTP": true
  },
  {
    "name": "Neha Dev",
    "email": "neha.dev46@example.com",
    "dept": "CSE",
    "rollno": "S20211046",
    "phone": "9876514399",
    "ug": "3",
    "section": "2",
    "bin": 1,
    "isBTP": true
  },
  {
    "name": "Aadhya Divya",
    "email": "aadhya.divya47@example.com",
    "dept": "CSE",
    "rollno": "S20211047",
    "phone": "9876519638",
    "ug": "2",
    "section": "1",
    "bin": 2,
    "isBTP": false
  },
  {
    "name": "Aadhya Anaya",
    "email": "aadhya.anaya48@example.com",
    "dept": "CSE",
    "rollno": "S20211048",
    "phone": "9876532253",
    "ug": "2",
    "section": "2",
    "bin": 2,
    "isBTP": false
  },
  {
    "name": "Anika Ira",
    "email": "anika.ira49@example.com",
    "dept": "CSE",
    "rollno": "S20211049",
    "phone": "9876558156",
    "ug": "3",
    "section": "2",
    "bin": 2,
    "isBTP": true
  },
];

 const parsedBin = Number(bin); // convert if needed
const filteredStudents = students.filter(student => student.bin === parsedBin);

 return (
    <div className="student-list">
      <div className="student-list-scroll">
        {filteredStudents.map((student, index) => (
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
                  onClick={() => onSelectStudent(student)}
                  disabled={selectedStudents[bin]?.rollno === student.rollno}
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