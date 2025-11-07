import { redirect } from "react-router-dom";

async function loadData(type) {
 
  console.log("Loader running for type:", type);
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  console.log("Token being sent:", token);
  console.log("Role:", role);

  if (!token || role !== "Admin") return redirect("/login");

  const response = await fetch(
    `http://localhost:3000/puser/feedback/dashboard/${type}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!response.ok) {
 
    console.error("Failed to fetch. Status:", response.status);
    throw new Response("Failed to fetch", { status: 500 });
  }
  
  return await response.json();
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