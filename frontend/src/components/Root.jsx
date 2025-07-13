import { Outlet } from "react-router";
import Sidebar from "./sidebar/Sidebar";
import Header from "./Header";


export default function RootLayout() {
  return (
    <div className="layout-grid"> {/* <-- NEW WRAPPER */}
      <Sidebar />
      <div className="content-area"> {/* Contains header + main */}
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
