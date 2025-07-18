import { useEffect } from "react";
import { Outlet, useLoaderData, useLocation, useSubmit } from "react-router";
import { getTokenDuration } from "../util/auth";
import Sidebar from "../components/sidebar/Sidebar";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";

export default function RootLayout() {
  const token = useLoaderData();
  const submit = useSubmit();
  useEffect(() => {
    if (!token) {
      return;
    }
    if (token === "EXPIRED") {
      submit(null, { action: "/logout", method: "post" });
      return;
    }
    const tokenDuration = getTokenDuration();
    setTimeout(() => {
      submit(null, { action: "/logout", method: "post" });
    }, tokenDuration);
  }, [token, submit]);

  const location = useLocation();
  const hideLayout =
    location.pathname === "/auth" || location.pathname === "/logout";

  if (hideLayout) {
    return <Outlet />;
  }

  return (
    <>
      <ProgressBar />
      <div className="layout-grid">
        <Sidebar />
        <div className="content-area">
          <Header />
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
