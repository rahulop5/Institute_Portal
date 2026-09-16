import { redirect } from "react-router";

export async function loader() {
  const role = localStorage.getItem("role");
  switch (role) {
    case "Faculty":
      return redirect("/academics/meetings/faculty");

    case "Student":
    case "UGStudentBTP":
      return redirect("/academics/meetings/student");

    default:
      throw new Response(
        JSON.stringify({ message: "Error loading Meetings dashboard" }),
        { status: 500 }
      );
  }
}
