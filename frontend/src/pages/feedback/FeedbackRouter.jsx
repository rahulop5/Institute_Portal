import { redirect } from "react-router";

export async function loader(){
    const role=localStorage.getItem("role");
    if(!role){
        redirect("/auth");
    }
    switch (role) {
        case "Student":
            return redirect("/academics/feedback/student")
    
        case "Faculty":
            return redirect("/academics/feedback/faculty")

        case "Admin":
            return redirect("/academics/feedback/admin")

        default:
            throw new Response(JSON.stringify({
                message: "Error loading Feedback"
            }), {
                status: 500
            });
    }
}