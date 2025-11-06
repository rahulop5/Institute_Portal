import styles from "../styles/facultyDashboard.module.css";
import profile from "../../../../assets/studenticon.svg";
import courseImg from "../../../../assets/math1.png";
import { redirect, useLoaderData, useNavigate } from "react-router";

export default function FacultyDashboard({ facultyData, onBack }) {
  // Dummy fallback data (used if no prop is passed)
  // const dummyData = {
  //   name: "Dr. Kavya Sharma",
  //   avgscore: 4.6,
  //   impressions: "270",
  //   coursestaught: 3,
  //   department: "CSE",
  //   courses: [
  //     { name: "Database Management Systems", coursecode: "DBMS101", avgscore: 4.7 },
  //     { name: "Computer Networks", coursecode: "CN103", avgscore: 4.4 },
  //     { name: "Operating Systems", coursecode: "OS102", avgscore: 4.6 },
  //   ],
  // };
  const navigate = useNavigate();
  const handleClickStatistics = (courseId) => {
    navigate(`/academics/feedback/faculty/${courseId}`);
  };

  // Use prop data if available, else use dummy
  const data = facultyData || useLoaderData();

  return (
    <div className={styles.container}>
      {onBack && (
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Dashboard
        </button>
      )}

      <h1>Feedback Form Overview</h1>

      <div className={styles.overviewbox}>
        <div className={styles.name}>
          <div className={styles.profileimg}>
            <img src={profile} alt="profileimg" />
          </div>
          <div>{data.name}</div>
        </div>

        <div className={styles.avgscore}>
          <div className={styles.scoreheading}>Average Score</div>
          <div className={styles.scorevalue}>{data.avgscore}</div>
        </div>

        <div className={styles.impressions}>
          <div className={styles.scoreheading}>Impressions</div>
          <div>{data.impressions}</div>
        </div>

        <div className={styles.coursestaught}>
          <div className={styles.scoreheading}>Courses Taught</div>
          <div className={styles.scorevalue}>{data.coursestaught}</div>
        </div>

        <div className={styles.department}>
          <div className={styles.scoreheading}>Department</div>
          <div>{data.department}</div>
        </div>
      </div>

      <div className={styles.coursesbox}>
        <h2>Your Courses</h2>
        <ul className={styles.courseList}>
          {data.courses.map((course) => (
            <li key={course.coursecode} className={styles.courseCard}>
              <div className={styles.courseLeft}>
                <div className={styles.iconWrapper}>
                  <img src={courseImg} alt="course icon" />
                </div>
                <div className={styles.courseInfo}>
                  <strong>{course.name}</strong>
                  <div className={styles.courseCode}>{course.coursecode}</div>
                </div>
              </div>

              <div className={styles.courseRight}>
                <div className={styles.avgScoreBox}>
                  <div className={styles.avgLabel}>Average Score</div>
                  <div className={styles.avgValue}>{course.avgscore}</div>
                </div>
                <button
                  onClick={() => handleClickStatistics(course.courseId)}
                  className={styles.viewBtn}
                >
                  View Statistics
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export async function loader() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  if (role !== "Student") {
    throw new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  const response = await fetch("http://localhost:3000/feedback/student", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const resData = await response.json();

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: resData.message || "Error loading Feedback dashboard",
      }),
      { status: response.status }
    );
  }

  return resData;
}
