import { useNavigate } from "react-router";
import styles from "../styles/ProjectList.module.css";
import studentIcon from "../../../../../assets/studenticon.svg";
import nextpageIcon from "../../../../../assets/nextpage.svg";

export default function ProjectList({ dataa }) {
  const navigate = useNavigate();
  console.log(dataa)

  // normalize backend response
  const projects = dataa?.projects || [];

  const handleNext = (projid) => {
    navigate(`/academics/btp/staff/${projid}`);
  };

  return (
    <div className={styles.container}>
      <h1>Team Management</h1>
      {projects.length > 0 ? (
        <>
          <div className={styles.header}>
            <div className={styles.topicheading}>Topic</div>
            <div className={styles.projectidheading}>Project ID</div>
            <div className={styles.teamheading}>Team</div>
          </div>
          <div className={styles.list}>
            {projects.map((item) => (
              <div key={item._id} className={styles.card}>
                {/* Topic */}
                <div className={styles.topic}>{item.topic}</div>

                {/* Project ID */}
                <div className={styles.teamid}>{item.projid}</div>

                {/* Team Members */}
                <div className={styles.team}>
                  {item.team.map((member, index) => (
                    <div key={index} className={styles.iconWrapper}>
                      <img src={studentIcon} alt={member} />
                      <span className={styles.hoverText}>{member}</span>
                    </div>
                  ))}
                </div>

                {/* Next Button */}
                <div className={styles.nextPagediv}>
                  <button
                    className={styles.nextPage}
                    onClick={() => handleNext(item.projid)}
                  >
                    <img src={nextpageIcon} alt="Next Page" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2>No Projects</h2>
      )}
    </div>
  );
}


export async function loader({ params }) {
  const { projid } = params;
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:3000/staff/btp/viewproject?projid=${projid}`, {
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Response("Failed to load project", { status: response.status });
  }
  const data = await response.json();
  return data;
}
