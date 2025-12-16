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