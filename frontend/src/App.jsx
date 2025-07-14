import { createBrowserRouter, RouterProvider } from "react-router";
import Homepage from "./pages/Homepage";
import RootLayout from "./pages/Root";
import Authentication, { action as authAction } from "./pages/Authentication";
import ErrorPage from "./pages/Error";
import BTPTeamselection_bin23 from "./components/Academics/BTP/Teamselection_bin23";
import { checkAuthLoader, tokenLoader } from "./util/auth";
import Temp from "./pages/Lemp";
import { action as logoutAction } from "./pages/Logout";
import BTPTeamselection_bin1 from "./components/academics/btp/Teamselection_bin1";
import BTPStudent from "./pages/BTPStudent";
import BTPRouter, { loader as btpLoader} from "./pages/BTPRouter";

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
          { path: "btp", element: <BTPRouter />, loader: btpLoader }
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
        path: "/auth",
        element: <Authentication />,
        action: authAction
      },
      { path: "/logout", action: logoutAction },
      { path: "/temp", loader: checkAuthLoader, element: <BTPTeamselection_bin23 /> },
      { path: "/temp2", loader: checkAuthLoader, element: <BTPTeamselection_bin1 /> }
    ]
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  )
}

export default App
