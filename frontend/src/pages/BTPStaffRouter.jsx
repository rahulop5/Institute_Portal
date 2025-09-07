import { useLoaderData } from "react-router";
import NotStarted from "../components/academics/btp/NotStarted";
import ErrorPage from "./Error";
import TeamListPage from "../components/Academics/BTP/staff/TeamFormation/Teamlistpage";
import FacultyManagement from "../components/academics/btp/staff/topicselection/FacultyManagement";
import Temp from "./Lemp";


export default function BTPStaffRouter(){
    const data=useLoaderData();
    const phase=data.phase;
    switch (phase) {
        case "NS":
            return <NotStarted />
    
        case "TF": 
            return <TeamListPage data={data} />

        case "FA": 
            return <FacultyManagement data={data} />
            
        case "IP":
            return <Temp />

        default:
            return <ErrorPage />
    }
}

export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "Staff":
            const response=await fetch("http://localhost:3000/staff/btp?batch=2022", {
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