

import { useLoaderData, useNavigate } from "react-router-dom";
import FacultyDashboard from "../faculty/facultyDashboard.jsx"; 

import { API_HOST } from "../../../../config";


export async function loader({ params }) {
  const token = localStorage.getItem("token"); // Get token for auth
  const facultyId = params.facultyId; // Get the ID from the URL

  // Call your new API endpoint
  const response = await fetch(
    API_HOST + `/puser/feedback/viewFaculty/?facultyId=${facultyId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch faculty details.");
  }

  const resData = await response.json();
  return resData.faculty; 
}


export default function AdminFacultyDetailPage() {
  const facultyData = useLoaderData(); 
  const navigate = useNavigate();


  const handleAdminCourseClick = (courseId) => {
    // This uses relative navigation, which is correct for the admin
    // It goes from .../faculty/:facultyId
    // to .../faculty/:facultyId/:courseId
    navigate(courseId);
  };

  return (
    <FacultyDashboard
      facultyData={facultyData}
      onBack={() => navigate("..")}
      onCourseClick={handleAdminCourseClick}
    />
  );
}