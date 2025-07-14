import { createBrowserRouter, RouterProvider } from "react-router";
import Sidebar from "./components/sidebar/Sidebar"
import Homepage from "./components/Homepage";
import RootLayout from "./components/Root";
import BTPTeamselection_bin1 from "./components/academics/btp/Teamselection_bin1";
import Auth from "./components/AuthForm";
import Authentication, { action as authAction } from "./pages/Authentication";
import ErrorPage from "./pages/Error";
import BTPTeamselection_bin23 from "./components/Academics/BTP/Teamselection_bin23";

const router=createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      //remove or edit this and put it in pages
      { path: "temp", element: <BTPTeamselection_bin1 /> }
    ]
  },
  //will have to deal with this based on the login page design
  {
    path: "/auth",
    errorElement: <ErrorPage />,
    element: <Authentication />,
    action: authAction
  }
]);

function App() {

  
  return (
    <RouterProvider router={router} />
  )
}

export default App
