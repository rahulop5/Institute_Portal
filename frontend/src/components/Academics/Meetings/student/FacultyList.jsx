import { Link, useLoaderData } from "react-router";
import styles from "./styles/FacultyList.module.css";
import { API_HOST } from "../../../../config";

export default function FacultyList() {
  const data = useLoaderData();
  const faculty = data?.faculty || [];

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Choose a faculty member</h2>
      {faculty.length === 0 ? (
        <p className={styles.empty}>No faculty found.</p>
      ) : (
        faculty.map((f) => (
          <Link key={f._id} to={`/academics/meetings/student/${f._id}/slots`} className={styles.card}>
            <div className={styles.name}>{f.name}</div>
            <div className={styles.dept}>{f.dept}</div>
          </Link>
        ))
      )}
    </div>
  );
}

export async function loader() {
  const token = localStorage.getItem("token");
  const response = await fetch(API_HOST + "/student/meetings/faculty", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Error loading faculty list" }), { status: 500 });
  }
  return await response.json();
}
