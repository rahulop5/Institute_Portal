import { useLoaderData } from "react-router-dom";
import CoursesHeader from "./CourseHeader"; 

export default function CoursesTab() {

  const data = useLoaderData();
  console.log("Loader Data in CoursesTab:", data);  
  const courseList = data?.activeCourses || [];
  const facultyList = data?.availableFaculty || [];

  return <CoursesHeader courses={courseList} faculty={facultyList} />;
}