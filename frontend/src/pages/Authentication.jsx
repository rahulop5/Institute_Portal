import { redirect } from "react-router";
import AuthForm from "../components/AuthForm";

export default function Authentication(){
    return <AuthForm />;
}

export async function action({request}){
    const formData=await request.formData();
    const authData={
        email: formData.get("email"),
        pass: formData.get("password")
    }
    const response=await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(authData)
    });

    //could add custom shit
    if(!response.ok){
        throw new Response(JSON.stringify({ message: "Error Logging in" }), {
            status: 500
        });
    }

    const resData=await response.json();
    const { token, name, role }=resData;
    //didnt handle expiration will do that later
    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    localStorage.setItem("role", role);

    const expiration=new Date();
    expiration.setHours(expiration.getHours()+1);
    localStorage.setItem("expiration", expiration.toISOString());

    return redirect("/");

}

