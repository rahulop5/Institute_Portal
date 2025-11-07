import { useLoaderData } from "react-router-dom";
import StudentHeader from "./StudentHeader"; // The component you provided

export default function StudentsTab() {
  // 1. This hook gets the data from 'adminDashboardStudentsLoader'
  const data = useLoaderData();
  const studentList = data?.students || [];

  // 2. Render your component, passing the *loaded* data as a prop
  return <StudentHeader students={studentList} />;
}