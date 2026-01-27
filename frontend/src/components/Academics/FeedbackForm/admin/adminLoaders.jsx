import { redirect } from "react-router-dom";
import { API_HOST } from "../../../../config";

async function loadData(type) { 
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  

  if (!token || role !== "Admin") return redirect("/login");

  const response = await fetch(
    API_HOST + `/puser/feedback/dashboard/${type}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) { 
    console.error("Failed to fetch. Status:", response.status);
    throw new Response("Failed to fetch", { status: 500 });
  }
  const resData=await response.json();

  return resData;
}

export async function adminDashboardFacultyLoader() {
  return await loadData("faculty");
}
export async function adminDashboardStudentsLoader() {
  return await loadData("students");
}
export async function adminDashboardCoursesLoader() {
  return await loadData("courses");
}

export async function courseDetailsLoader({ params }) {
  const token = localStorage.getItem("token");
  const courseId = params.courseId;
  
  if (!token) return redirect("/login");

  const response = await fetch(
    API_HOST + `/puser/feedback/viewCourse?courseId=${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
    const hehe=await response.json();
    console.log(hehe.message);
    if (response.status === 403 || response.status === 404) {
      const err = await response.json();
      throw new Error(err.message || "Could not fetch course details");
    }
    throw new Response("Failed to fetch course details", { status: 500 });
  }

  return await response.json();
}