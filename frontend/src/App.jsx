import { createBrowserRouter, RouterProvider } from "react-router";
import Sidebar from "./components/sidebar/Sidebar"
import Homepage from "./components/Homepage";
import RootLayout from "./components/Root";

const router=createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Homepage /> }
    ]
  }
]);

function App() {

  
  return (
    <RouterProvider router={router} />
  )
}

export default App
