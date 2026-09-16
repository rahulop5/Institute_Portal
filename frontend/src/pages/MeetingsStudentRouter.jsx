import { NavLink, Outlet } from "react-router";
import styles from "../components/Academics/Meetings/student/styles/MeetingsStudent.module.css";

export default function MeetingsStudentRouter() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Meetings</h1>
      <nav className={styles.tabs}>
        <NavLink
          to="/academics/meetings/student"
          end
          className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
        >
          Book a meeting
        </NavLink>
        <NavLink
          to="/academics/meetings/student/mybookings"
          className={({ isActive }) => (isActive ? styles.tabActive : styles.tab)}
        >
          My meetings
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}

export async function loader() {
  const role = localStorage.getItem("role");
  if (role !== "Student" && role !== "UGStudentBTP") {
    throw new Response(
      JSON.stringify({ message: "Error loading Meetings dashboard" }),
      { status: 500 }
    );
  }
  return null;
}
