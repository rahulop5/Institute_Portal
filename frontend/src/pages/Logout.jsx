import { redirect } from "react-router";

export function action(){
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("expiration");
    localStorage.removeItem("role");

    return redirect("/auth");
}