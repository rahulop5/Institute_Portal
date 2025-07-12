import { Outlet } from "react-router";
import Sidebar from "./sidebar/Sidebar";

export default function RootLayout(){
    return (
        <>
            <Sidebar />
            <main>
                <Outlet />
            </main>
        </>
    );
}