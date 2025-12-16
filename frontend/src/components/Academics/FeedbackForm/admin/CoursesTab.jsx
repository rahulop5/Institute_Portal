import { useLoaderData } from "react-router-dom";
import CoursesHeader from "./CourseHeader"; 

export default function CoursesTab() {

  const data = useLoaderData();
  const courseList = data?.ugWiseCourses || [];
  const facultyList = data?.availableFaculty || [];
  const adminDepartments = data?.adminDepartments || [];

  return <CoursesHeader batchWiseCourses={courseList} faculty={facultyList} adminDepartments={adminDepartments} />;
}