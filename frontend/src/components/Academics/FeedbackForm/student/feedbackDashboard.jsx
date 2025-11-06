import { useLoaderData } from "react-router";
import { useLoaderData } from "react-router-dom";
import FacultySelection from "./Facultyselection";
import FormPage from "./formpage";
import StartPage from "./startpage";

export default function FeedbackDashboardStudent() {
  const data=useLoaderData();
  
  // Sample data for demonstration
  // const data = {
  //   email: "ananya.g25@iiits.in",
  //   started: false,
  //   submitted: false
  // };
  const data = useLoaderData();
  // console.log("data");
  console.log("📦 Loader data in component:", data);

  return (
    <div>
        {!data.started && !data.submitted && (
            <div>
                <FacultySelection data={data} />
            </div>
        )}
      {!data.started && !data.submitted && (
        <FacultySelection courses={data.courses} />
      )}

      {data.started && !data.submitted && (
        <FormPage feedback={data.feedback} />
      )}

      {data.submitted && <StartPage message={data.message} />}
    </div>
  );
}

export async function loader() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  switch (role) {
    case "Student":
      //add custom logic for batch later using URL
      const response = await fetch(
        "http://localhost:3000/student/feedback",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      //add custom messages for 403 and 404
      if (!response.ok) {
        const resData = await response.json();
        throw new Response(
          JSON.stringify({
            message: "Error loading Feedback dashboard",
          }),
          {
            status: 500,
          }
        );
      }
      const resData = await response.json();
      console.log(resData)
      return resData;

    //handle other users later
    default:
      throw new Response(
        JSON.stringify({
          message: "Error loading BTP dashboard",
        }),
        {
          status: 500,
        }
      );
  }
}


export async function loader() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  switch (role) {
    case "Student":
      //add custom logic for batch later using URL
      const response = await fetch(
        "http://localhost:3000/student/feedback",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      //add custom messages for 403 and 404
      if (!response.ok) {
        const resData = await response.json();

        throw new Response(
          JSON.stringify({
            message: "Error loading Feedback dashboard",
          }),
          {
            status: 500,
          }
        );
      }
      const resData = await response.json();
      console.log("random shit " , resData)
      return resData;

    //handle other users later
    default:
      throw new Response(
        JSON.stringify({
          message: "Error loading Student dashboard",
        }),
        {
          status: 500,
        }
      );
  }
}