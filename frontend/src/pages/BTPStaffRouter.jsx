import { useLoaderData } from "react-router";
import NotStarted from "../components/Academics/BTP/NotStarted";
import ErrorPage from "./Error";
import TeamListPage from "../components/Academics/BTP/staff/TeamFormation/Teamlistpage";
import FacultyManagement from "../components/Academics/BTP/staff/topicselection/FacultyManagement";
import Temp from "./Lemp";
import Inprogressstaff from "../components/Academics/BTP/staff/inprogress/Inprogress";
import ProjectList from "../components/Academics/BTP/staff/inprogress/ProjectList";

import { API_HOST } from "../config";


const normalizeBackendData = (backend) => {
  const { project, ...rest } = backend;

  return {
    ...rest,
    project: {
      ...project,
      latestUpdates: project.latestUpdates.map((u) => ({
        title: "Update", // or slice first 20 chars of u.update
        description: u.update,
        timestamp: u.time,
      })),
      updates: project.latestUpdates.map((u) => ({
        time: u.time,
        update: u.update,
      })),
    },
  };
};


export default function BTPStaffRouter(){
    const data=useLoaderData();
    const phase=data.phase;
    switch (phase) {
        case "NS":
            return <NotStarted />
    
        case "TF": 
            return <TeamListPage data={data} />

        case "FA": 
            return <FacultyManagement dataa={data} />
            
        case "IP":
            // return <Inprogressstaff dataa={normalizeBackendData(data)}  />
            return <ProjectList dataa={data} />

        default:
            return <ErrorPage />
    }
}

export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "Staff":
            const response=await fetch(API_HOST + "/staff/btp?batch=2022", {
                headers: {
                    "Authorization": "Bearer "+token
                }
            });
            //add custom messages for 403 and 404
            if(!response.ok){
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