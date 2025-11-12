import { useLoaderData } from "react-router-dom";
import CoursesHeader from "./CourseHeader"; 

export default function CoursesTab() {

  const data = useLoaderData();
  console.log("Loader Data in CoursesTab:", data);  
  const courseList = data?.batchWiseCourses || [];
  const facultyList = data?.availableFaculty || [];

  return <CoursesHeader batchWiseCourses={courseList} faculty={facultyList} />;
}