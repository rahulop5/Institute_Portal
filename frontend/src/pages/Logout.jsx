import { redirect } from "react-router";

export function action(){
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("expiration");

    return redirect("/auth");
}