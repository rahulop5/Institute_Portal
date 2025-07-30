import { redirect } from "react-router";

export async function loader(){
    const role=localStorage.getItem("role");
    if(!role){
        redirect("/auth");
    }
    switch (role) {
        case "UGStudentBTP":
            return redirect("/academics/btp/student")
    
        case "Faculty":
            return redirect("/academics/btp/faculty")

        default:
            throw new Response(JSON.stringify({
                message: "Error loading BTP dashboard"
            }), {
                status: 500
            });
    }
}