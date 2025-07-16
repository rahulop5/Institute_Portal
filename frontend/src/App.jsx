import { createBrowserRouter, RouterProvider } from "react-router";
import Homepage from "./pages/Homepage";
import RootLayout from "./pages/Root";
import Authentication, { action as authAction } from "./pages/Authentication";
import ErrorPage from "./pages/Error";
import BTPTeamselection_bin23, { action as acceptTRAction, action2 as rejectTRAction } from "./components/academics/BTP/Teamselection_bin23";
import { checkAuthLoader, tokenLoader } from "./util/auth";
import Temp from "./pages/Lemp";
import { action as logoutAction } from "./pages/Logout";
import BTPTeamselection_bin1, { action as sendTRAction } from "./components/academics/btp/Teamselection_bin1";
import BTPRouter, { loader as btpLoader} from "./pages/BTPRouter";
import FacultySelection, { action as applytotopicAction } from "./components/academics/btp/Facultyselection";
import Inprogress from "./components/Academics/BTP/Inprogress";

const router=createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <RootLayout />,
    id: "root",
    loader: tokenLoader,
    children: [
      { index: true, element: <Homepage />, loader: checkAuthLoader },
      { path: "academics",
        loader: checkAuthLoader,
        children: [
          {path: ":smth", element: <Temp />},
          { 
            path: "btp", element: <BTPRouter />,
            loader: btpLoader,
            children: [
              {path: "sendteamrequest", action: sendTRAction, element: <></>},
              {path: "acceptteamrequest", action: acceptTRAction, element: <></>},
              {path: "rejectteamrequest", action: rejectTRAction, element: <></>},
              {path: "applytotopic", action: applytotopicAction, element: <></>}
            ]
          }
        ]
      },
      { path: "people",
        loader: checkAuthLoader,
        children: [
          {path: ":smth", element: <Temp />}
        ]
      },
      { path: "settings", element: <Temp />, loader: checkAuthLoader },
      {
        path: "auth",
        element: <Authentication />,
        action: authAction
      },
      
      { path: "logout", action: logoutAction },
      { path: "temp", element: <BTPTeamselection_bin23 /> },
      { path: "temp2", loader: checkAuthLoader, element: <Inprogress /> },
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
