import { useLoaderData } from "react-router";
import ErrorPage from "./Error";
import TopicSelection from "../components/Academics/BTP/student/TopicSelection";
import Inprogress from "../components/Academics/BTP/student/IP/Inprogress";
import Completed from "../components/Academics/BTP/student/Completed";

import { API_HOST } from "../config";


export default function BTPStudentRouter(){
    const data=useLoaderData();
    const phase=data.phase;
    switch (phase) {
        case "TOPIC_SELECTION":
            return <TopicSelection data={data} />

        case "IN_PROGRESS":
            return <Inprogress data={data} />

        case "COMPLETED":
            return <Completed data={data} />

        default:
            return <ErrorPage />
    }

}

export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "Student":
        case "UGStudentBTP":
            const response=await fetch(API_HOST + "/student/btp", {
                headers: {
                    "Authorization": "Bearer "+token
                }
            });
            //add custom messages for 403 and 404
            if(!response.ok){
                const error=await response.json();
                console.log(error.message);
                throw new Response(JSON.stringify({
                    message: error.message
                }), {
                    status: response.status
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