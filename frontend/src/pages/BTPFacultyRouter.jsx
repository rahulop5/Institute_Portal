import { Outlet, useMatch, useLoaderData } from "react-router";
import ErrorPage from "./Error";
import TopicAddtion from "../components/academics/btp/faculty/TopicAddition";
import EvaluationPage from "../components/academics/btp/faculty/EvaluationPage";

export default function BTPFacultyRouter() {
  const data = useLoaderData();
  const phase = data.phase;

  const isViewingProject = useMatch("/academics/btp/faculty/:projid");
  const isViewingProjectEvaluator = useMatch("/academics/btp/faculty/evaluator/:projid");

  if (isViewingProject) {
    return <Outlet />;
  }

  if (isViewingProjectEvaluator) {
    return <Outlet />;
  }

  switch (phase) {
    case "NOT_STARTED":
    case "TEAM_FORMATION":
    case "FACULTY_ASSIGNMENT":
      return <TopicAddtion data={data} />;
    case "IN_PROGRESS":
      return <EvaluationPage data={data} />;
    default:
      return <ErrorPage />;
  }
}



export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "Faculty":
            //add custom logic for batch later using URL
            const response=await fetch("http://localhost:3000/faculty/btp?batch=2022", {
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