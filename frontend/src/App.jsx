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
import BTPStudentRouter, { loader as btpLoader} from "./pages/BTPStudentRouter.jsx";
import { action as applytotopicAction } from "./components/academics/btp/student/FA/Facultyselection";
import Inprogress, { action as addUpdateAction } from "./components/academics/btp/student/IP/Inprogress";
import TopicAddition from "./components/academics/btp/faculty/TopicAddition.jsx";
import BTPFacultyRouter, { loader as btpFacultyRouter } from "./pages/BTPFacultyRouter.jsx";
import { loader as btpRouterLoader } from "./pages/BTPRouter.jsx";
import { action2 as deleteTopicAction, action as addTopicAction } from "./components/academics/btp/faculty/Topicslist.jsx";
import { action as acceptReqAction, action2 as rejectReqAction } from "./components/academics/btp/faculty/Requests.jsx";
// import EvaluationPage from "./components/academics/btp/faculty/Evaluationpage.jsx";
import StudentInProgress, { loader as projectLoader } from "./components/academics/btp/faculty/StudentInProgress.jsx";
import { evaluateEvaluatorAction, evaluateGuideAction } from "./components/academics/btp/faculty/EvaluatorModal.jsx";
import ViewProjEvaluator, { evaluatorProjLoader } from "./components/academics/btp/faculty/ViewProjEvaluator.jsx";
import FileUploadPage from "./components/Academics/BTP/staff/NotStarted/fileUploadPage.jsx";
import Header from "./components/Header.jsx";
import TeamListPage from "./components/Academics/BTP/staff/TeamFormation/Teamlistpage.jsx";
import FacultyManagement from "./components/Academics/BTP/staff/topicselection/FacultyManagement.jsx";

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
      { path: "temp", element: <TeamListPage/> },
      { path: "academics",
        loader: checkAuthLoader,
        children: [
          {path: ":smth", element: <Temp />},
          { 
            path: "btp",
            children: [
              {
                index: true,
                loader: btpRouterLoader,
                element: <></>
              },
              {path: "student", element: <BTPStudentRouter />,
                loader: btpLoader,
                children: [
                  {path: "sendteamrequest", action: sendTRAction, element: <></>},
                  {path: "acceptteamrequest", action: acceptTRAction, element: <></>},
                  {path: "rejectteamrequest", action: rejectTRAction, element: <></>},
                  {path: "applytotopic", action: applytotopicAction, element: <></>},
                  {path: "addupdate", action: addUpdateAction, element: <></>}
                ]
              },
              {
                path: "faculty", element: <BTPFacultyRouter />,
                loader: btpFacultyRouter,
                children: [
                  {path: ":projid", loader: projectLoader, element: <StudentInProgress /> },
                  {path: "evaluator/:projid", loader: evaluatorProjLoader, element: <ViewProjEvaluator /> },
                  {path: "addtopic", action: addTopicAction, element: <></>},
                  {path: "deletetopic", action: deleteTopicAction, element: <></>},
                  {path: "accepttopicrequest", action: acceptReqAction, element: <></>},
                  {path: "rejecttopicrequest", action: rejectReqAction, element: <></>},
                  {path: "evaluateguide", action: evaluateGuideAction, element: <></>},
                  {path: "evaluateevaluator", action: evaluateEvaluatorAction, element: <></>}
                ]
              }
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
