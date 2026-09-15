import { Outlet, useMatch, useLoaderData } from "react-router";
import TopicAddition from "../components/Academics/BTP/faculty/TopicAddition";
import EvaluationPage from "../components/Academics/BTP/faculty/EvaluationPage";

import { API_HOST } from "../config";


export default function BTPFacultyRouter() {
  const data = useLoaderData();

  const isViewingProject = useMatch("/academics/btp/faculty/:projid");
  const isViewingProjectEvaluator = useMatch("/academics/btp/faculty/evaluator/:projid");

  if (isViewingProject) {
    return <Outlet />;
  }

  if (isViewingProjectEvaluator) {
    return <Outlet />;
  }

  // Faculty don't have phases any more - topic management and project
  // evaluation are both always available at once (see facultybtpController.js).
  return (
    <>
      <TopicAddition data={data} />
      <EvaluationPage data={data} />
    </>
  );
}



export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "Faculty":
            //add custom logic for batch later using URL
            const response=await fetch(API_HOST + "/faculty/btp?batch=2022", {
                headers: {
                    "Authorization": "Bearer "+token
                }
            });
            //add custom messages for 403 and 404
            if(!response.ok){
                const resData=await response.json();

                throw new Response(JSON.stringify({
                    message: "Error loading BTP dashboard"
                }), {
                    status: 500
                });
            }
            const resData=await response.json();
            return resData;
        
        //handle other users later
        default:
            throw new Response(JSON.stringify({
                message: "Error loading BTP dashboard"
            }), {
                status: 500
            });
    }
}