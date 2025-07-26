import { useLoaderData } from "react-router";
import NotStarted from "../components/academics/btp/NotStarted";
import ErrorPage from "./Error";
import BTPTeamselection_bin1 from "../components/academics/btp/Teamselection_bin1";
import BTPTeamselection_bin23 from "../components/academics/btp/Teamselection_bin23";
import FacultySelection from "../components/academics/btp/Facultyselection";
import FSBin23 from "../components/academics/btp/FSBin23";
import Inprogress from "../components/Academics/BTP/Inprogress";

export default function BTPRouter(){
    const data=useLoaderData();
    const phase=data.phase;
    switch (phase) {
        case "NS":
            return <NotStarted />
    
        case "TF": 
            switch (data.bin) {
                case 1:
                    return <BTPTeamselection_bin1 data={data} />
                case 2:
                case 3: 
                    return <BTPTeamselection_bin23 data={data} />
                default:
                    return <ErrorPage />
            }

        case "FA": 
            return <FacultySelection data={data} />
            
        case "IP":
            return <Inprogress data={data} />

        default:
            return <ErrorPage />
    }
    
}

export async function loader(){
    const role=localStorage.getItem("role");
    const token=localStorage.getItem("token");
    switch (role) {
        case "UGStudentBTP":
            const response=await fetch("http://localhost:3000/student/btp", {
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