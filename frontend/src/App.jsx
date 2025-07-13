import { createBrowserRouter, RouterProvider } from "react-router";
import Sidebar from "./components/sidebar/Sidebar"
import Homepage from "./components/Homepage";
import RootLayout from "./components/Root";
import BTPTeamselection_bin1 from "./components/Academics/BTP/Teamselection_bin1";

const router=createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> },
      {path: "temp", element: <BTPTeamselection_bin1 /> }
    ]
  }
]);

function App() {

  
  return (
    <RouterProvider router={router} />
  )
}

export default App
