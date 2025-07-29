import { createBrowserRouter, RouterProvider } from "react-router";
import Homepage from "./pages/Homepage";
import RootLayout from "./pages/Root";
import Authentication, { action as authAction } from "./pages/Authentication";
import ErrorPage from "./pages/Error";
import { action as acceptTRAction, action2 as rejectTRAction } from "./components/academics/btp/student/TF/Teamselection_bin23";
import { checkAuthLoader, tokenLoader } from "./util/auth";
import Temp from "./pages/Lemp";
import { action as logoutAction } from "./pages/Logout";
import { action as sendTRAction } from "./components/academics/btp/student/TF/Teamselection_bin1";
import BTPRouter, { loader as btpLoader} from "./pages/BTPRouter";
import { action as applytotopicAction } from "./components/academics/btp/student/FA/Facultyselection";
import Inprogress, { action as addUpdateAction } from "./components/academics/btp/student/IP/Inprogress";
import TopicAddtion from "./components/Academics/BTP/faculty/TopicAddition.jsx";

// Added a comment
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
              {path: "applytotopic", action: applytotopicAction, element: <></>},
              {path: "addupdate", action: addUpdateAction, element: <></>}
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
      { path: "temp", element: <TopicAddtion/> },
    ]
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
