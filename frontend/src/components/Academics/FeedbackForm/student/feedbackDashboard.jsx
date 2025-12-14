import { useLoaderData } from "react-router";
import { useState } from "react";
// import { useLoaderData } from "react-router-dom";
import FacultySelection from "./Facultyselection";
import FormPage from "./formpage";
import StartPage from "./startpage";

import { API_HOST } from "../../../../config";

export default function FeedbackDashboardStudent() {
  const data=useLoaderData();
  const [showFacultySelection, setShowFacultySelection] = useState(false);
  
  // Sample data for demonstration
  // const data = {
  //   email: "ananya.g25@iiits.in",
  //   started: false,
  //   submitted: false
  // };
  // const data = useLoaderData();

  console.log(data);

  const handleStartFeedback = () => {
    setShowFacultySelection(true);
  };

  return (
    <div>
      {!data.started && !data.submitted && !showFacultySelection && (
        <StartPage onStart={handleStartFeedback} />
      )}

      {!data.started && !data.submitted && showFacultySelection && (
        <FacultySelection data={data} />
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
        API_HOST + "/student/feedback",
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


