import { createBrowserRouter, RouterProvider } from "react-router";
import Homepage from "./src/pages/Homepage.jsx";
import RootLayout from "./src/pages/Root.jsx";
import Authentication, { action as authAction } from "./src/pages/Authentication.jsx";
import ErrorPage from "./src/pages/Error.jsx";
import { action as acceptTRAction, action2 as rejectTRAction } from "./src/components/academics/btp/student/TF/Teamselection_bin23.jsx";
import { checkAuthLoader, tokenLoader } from "./src/util/auth.js";
import Temp from "./src/pages/Lemp.jsx";
import { action as logoutAction } from "./src/pages/Logout.jsx";
import { action as sendTRAction } from "./src/components/academics/btp/student/TF/Teamselection_bin1.jsx";
import BTPStudentRouter, { loader as btpLoader} from "./src/pages/BTPStudentRouter.jsx";
import { action as applytotopicAction, setPreferencesAction } from "./src/components/academics/btp/student/FA/Facultyselection.jsx";
import Inprogress, { action as addUpdateAction } from "./src/components/academics/btp/student/IP/Inprogress.jsx";
import TopicAddition from "./src/components/academics/btp/faculty/TopicAddition.jsx";
import BTPFacultyRouter, { loader as btpFacultyRouter } from "./src/pages/BTPFacultyRouter.jsx";
import { loader as btpRouterLoader } from "./src/pages/BTPRouter.jsx";
import { action2 as deleteTopicAction, action as addTopicAction } from "./src/components/academics/btp/faculty/Topicslist.jsx";
import { action as acceptReqAction, action2 as rejectReqAction } from "./src/components/academics/btp/faculty/Requests.jsx";
import StudentInProgress, { loader as projectLoader } from "./src/components/academics/btp/faculty/StudentInProgress.jsx";
import { evaluateEvaluatorAction, evaluateGuideAction } from "./src/components/academics/btp/faculty/EvaluatorModal.jsx";
import ViewProjEvaluator, { evaluatorProjLoader } from "./src/components/academics/btp/faculty/ViewProjEvaluator.jsx";
import FileUploadPage from "./src/components/Academics/BTP/staff/NotStarted/fileUploadPage.jsx";
import Header from "./src/components/Header.jsx";
import TeamListPage from "./src/components/Academics/BTP/staff/TeamFormation/Teamlistpage.jsx";
import FacultyManagement, { advancePreferenceAction, assignGuideAction } from "./src/components/Academics/BTP/staff/topicselection/FacultyManagement.jsx";
import BTPStaffRouter, { loader as btpStaffLoader } from "./src/pages/BTPStaffRouter.jsx";
import { deleteTeamAction, updateTeamAction } from "./src/components/Academics/BTP/staff/TeamFormation/Overviewdialog.jsx";
import { action as addStudentAction } from "./src/components/academics/btp/student/TF/AddStudentmodal.jsx";
// import Inprogress from "./components/Academics/BTP/staff/inprogress/Inprogress.jsx";
import Inprogressstaff from "./src/components/Academics/BTP/staff/inprogress/Inprogress.jsx";
import StartPage from "./src/components/Academics/FeedbackForm/student/startpage.jsx";
import FacultySelection from "./src/components/Academics/FeedbackForm/faculty/facultyDashboard.jsx";
// Added a comment
import FormPage from "./src/components/Academics/FeedbackForm/student/formpage.jsx";
import FeedbackDashboardStudent from "./src/components/Academics/FeedbackForm/student/feedbackDashboard.jsx";
import FacultyDashboard from "./src/components/Academics/FeedbackForm/faculty/facultyDashboard.jsx";
import AdminDashboard from "./src/components/Academics/FeedbackForm/admin/adminDashboard.jsx";
import FacultyStats from "./src/components/Academics/FeedbackForm/faculty/facultyStats.jsx";
import Register from "./src/components/Academics/FeedbackForm/login/register.jsx";
import OTPverification from "./src/components/Academics/FeedbackForm/login/OTPverification.jsx";
import {loader as projectListLoader} from "./src/components/Academics/BTP/staff/inprogress/ProjectList.jsx";

const router=createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <RootLayout />,
    id: "root",
    loader: tokenLoader,
    children: [
      { index: true, element: <Homepage />, loader: checkAuthLoader },
      { path: "temp", element: <AdminDashboard/> },
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
                  {path: "addteammember", action: addStudentAction, element: <></>},
                  {path: "acceptteamrequest", action: acceptTRAction, element: <></>},
                  {path: "rejectteamrequest", action: rejectTRAction, element: <></>},
                  {path: "applytotopic", action: applytotopicAction, element: <></>},
                  {path: "setpreferences", action: setPreferencesAction, element: <></>},
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
              },
              {
                path: "staff", element: <BTPStaffRouter />,
                loader: btpStaffLoader,
                children: [
                  {path: ":projid", loader: projectListLoader, element: <Inprogressstaff /> },
                  { path: "updateteam", action: updateTeamAction, element: <></> },
                  { path: "deleteteam", action: deleteTeamAction, element: <></> },
                  { path: "advancepreferencernd", action: advancePreferenceAction, element: <></> },
                  { path: "assignGuide", action: assignGuideAction, element: <></> }
                ]
              }
              
            ]
          },
          {
            path: "feedback",
            children: [
              {
                index: true,
                // loader: tokenLoader,
                element: <></>
              },
              {path: "student", element: <FeedbackDashboardStudent />},
              // {path: "faculty", element: <FacultyDashboard />}
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
