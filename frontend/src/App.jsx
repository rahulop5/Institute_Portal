import { createBrowserRouter, RouterProvider, redirect } from "react-router";
import Homepage from "./pages/Homepage.jsx";
import RootLayout from "./pages/Root.jsx";
import Authentication, {
  action as authAction,
} from "./pages/Authentication.jsx";
import ErrorPage from "./pages/Error.jsx";
import {
  action as acceptTRAction,
  action2 as rejectTRAction,
} from "./components/academics/btp/student/TF/Teamselection_bin23.jsx";
import { checkAuthLoader, tokenLoader } from "./util/auth.js";
import Temp from "./pages/Lemp.jsx";
import { action as logoutAction } from "./pages/Logout.jsx";
import { action as sendTRAction } from "./components/academics/btp/student/TF/Teamselection_bin1.jsx";
import BTPStudentRouter, {
  loader as btpLoader,
} from "./pages/BTPStudentRouter.jsx";
import {
  action as applytotopicAction,
  setPreferencesAction,
} from "./components/academics/btp/student/FA/Facultyselection.jsx";
import Inprogress, {
  action as addUpdateAction,
} from "./components/academics/btp/student/IP/Inprogress.jsx";
import TopicAddition from "./components/academics/btp/faculty/TopicAddition.jsx";
import BTPFacultyRouter, {
  loader as btpFacultyRouter,
} from "./pages/BTPFacultyRouter.jsx";
import { loader as btpRouterLoader } from "./pages/BTPRouter.jsx";
import {
  action as addTopicAction,
  action2 as deleteTopicAction,
} from "./components/academics/btp/faculty/Topicslist.jsx";
import {
  action as acceptReqAction,
  action2 as rejectReqAction,
} from "./components/academics/btp/faculty/Requests.jsx";
import StudentInProgress, {
  loader as projectLoader,
} from "./components/academics/btp/faculty/StudentInProgress.jsx";
import {
  evaluateEvaluatorAction,
  evaluateGuideAction,
} from "./components/academics/btp/faculty/EvaluatorModal.jsx";
import ViewProjEvaluator, {
  evaluatorProjLoader,
} from "./components/academics/btp/faculty/ViewProjEvaluator.jsx";
import {
  advancePreferenceAction,
  assignGuideAction,
} from "./components/Academics/BTP/staff/topicselection/FacultyManagement.jsx";
import BTPStaffRouter, {
  loader as btpStaffLoader,
} from "./pages/BTPStaffRouter.jsx";
import {
  deleteTeamAction,
  updateTeamAction,
} from "./components/Academics/BTP/staff/TeamFormation/Overviewdialog.jsx";
import { action as addStudentAction } from "./components/academics/btp/student/TF/AddStudentmodal.jsx";
import Inprogressstaff from "./components/Academics/BTP/staff/inprogress/Inprogress.jsx";
import AdminDashboard from "./components/Academics/FeedbackForm/admin/adminDashboard.jsx";
import {
  adminDashboardFacultyLoader,
  adminDashboardStudentsLoader,
  adminDashboardCoursesLoader,
} from "./components/Academics/FeedbackForm/admin/adminLoaders.jsx";
import { loader as projectListLoader } from "./components/Academics/BTP/staff/inprogress/ProjectList.jsx";
import { loader as feedbackRouter } from "./pages/feedback/FeedbackRouter.jsx";
import FacultyDashboard, {
  loader as facultyFeedbackLoader,
} from "./components/Academics/FeedbackForm/faculty/facultyDashboard.jsx";
import FacultyStatistics, {
  loader as facultyViewStatsLoader,
} from "./components/academics/FeedbackForm/faculty/facultyStats.jsx";
import AcademicsLayout from "./pages/AcademicsLayout.jsx";
import { action as selectFacultyAction } from "./components/Academics/FeedbackForm/student/Facultyselection.jsx";
import FormPage, {
  nextAction,
  submitAction,
} from "./components/Academics/FeedbackForm/student/formpage.jsx";
import FeedbackDashboardStudent, {
  loader as studentFeedbackDashboardLoader,
} from "./components/Academics/FeedbackForm/student/feedbackDashboard.jsx";
import FacultyTab from "./components/Academics/FeedbackForm/admin/FacultyTab.jsx";
import StudentsTab from "./components/Academics/FeedbackForm/admin/StudentsTab.jsx";
import CoursesTab from "./components/Academics/FeedbackForm/admin/CoursesTab.jsx";
import AdminFacultyDetailPage, {
  loader as facultyDetailLoader,
} from "./components/Academics/FeedbackForm/admin/AdminFacultyDetailPage.jsx";
import AdminFacultyStatistics, {
  adminCourseStatisticsLoader,
} from "./components/Academics/FeedbackForm/admin/AdminFacultyStatistics.jsx";
import { addStudentsAction } from "./components/Academics/FeedbackForm/admin/StudentFileModal.jsx";
import { addFacultyAction } from "./components/Academics/FeedbackForm/admin/AddFacultyFileModal.jsx";
import { deleteCourseAction } from "./components/Academics/FeedbackForm/admin/CourseHeader.jsx";
import Register1 from "./components/academics/FeedbackForm/login/register.jsx";
import { addCourseAction } from "./components/Academics/FeedbackForm/admin/AddCourseModal.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <RootLayout />,
    id: "root",
    loader: tokenLoader,
    children: [
      {
        index: true,
        element: <Homepage />,
        loader: checkAuthLoader,
      },
      {
        path: "temp",
        element: <Register1 />,
      },
      {
        path: "academics",
        element: <AcademicsLayout />,
        loader: checkAuthLoader,
        children: [
          { path: ":smth", element: <Temp /> },
          {
            path: "btp",
            children: [
              {
                index: true,
                loader: btpRouterLoader,
                element: <></>,
              },
              {
                path: "student",
                element: <BTPStudentRouter />,
                loader: btpLoader,
                children: [
                  {
                    path: "sendteamrequest",
                    action: sendTRAction,
                    element: <></>,
                  },
                  {
                    path: "addteammember",
                    action: addStudentAction,
                    element: <></>,
                  },
                  {
                    path: "acceptteamrequest",
                    action: acceptTRAction,
                    element: <></>,
                  },
                  {
                    path: "rejectteamrequest",
                    action: rejectTRAction,
                    element: <></>,
                  },
                  {
                    path: "applytotopic",
                    action: applytotopicAction,
                    element: <></>,
                  },
                  {
                    path: "setpreferences",
                    action: setPreferencesAction,
                    element: <></>,
                  },
                  {
                    path: "addupdate",
                    action: addUpdateAction,
                    element: <></>,
                  },
                ],
              },
              {
                path: "faculty",
                element: <BTPFacultyRouter />,
                loader: btpFacultyRouter,
                children: [
                  {
                    path: ":projid",
                    loader: projectLoader,
                    element: <StudentInProgress />,
                  },
                  {
                    path: "evaluator/:projid",
                    loader: evaluatorProjLoader,
                    element: <ViewProjEvaluator />,
                  },
                  { path: "addtopic", action: addTopicAction, element: <></> },
                  {
                    path: "deletetopic",
                    action: deleteTopicAction,
                    element: <></>,
                  },
                  {
                    path: "accepttopicrequest",
                    action: acceptReqAction,
                    element: <></>,
                  },
                  {
                    path: "rejecttopicrequest",
                    action: rejectReqAction,
                    element: <></>,
                  },
                  {
                    path: "evaluateguide",
                    action: evaluateGuideAction,
                    element: <></>,
                  },
                  {
                    path: "evaluateevaluator",
                    action: evaluateEvaluatorAction,
                    element: <></>,
                  },
                ],
              },
              {
                path: "staff",
                element: <BTPStaffRouter />,
                loader: btpStaffLoader,
                children: [
                  {
                    path: ":projid",
                    loader: projectListLoader,
                    element: <Inprogressstaff />,
                  },
                  {
                    path: "updateteam",
                    action: updateTeamAction,
                    element: <></>,
                  },
                  {
                    path: "deleteteam",
                    action: deleteTeamAction,
                    element: <></>,
                  },
                  {
                    path: "advancepreferencernd",
                    action: advancePreferenceAction,
                    element: <></>,
                  },
                  {
                    path: "assignGuide",
                    action: assignGuideAction,
                    element: <></>,
                  },
                ],
              },
            ],
          },
          {
            path: "feedback",
            children: [
              {
                index: true,
                loader: feedbackRouter,
                element: <></>,
              },
              {
                path: "student",
                children: [
                  {
                    index: true,
                    loader: studentFeedbackDashboardLoader,
                    element: <FeedbackDashboardStudent />,
                  },
                  {
                    path: "selectfaculty",
                    action: selectFacultyAction,
                    element: <></>,
                  },
                  {
                    path: "updatefeedback",
                    action: nextAction,
                    element: <></>,
                  },
                  {
                    path: "submitfeedback",
                    action: submitAction,
                    element: <></>,
                  },
                ],
              },
              {
                path: "admin",
                element: <AdminDashboard />,
                children: [
                  {
                    index: true,
                    element: <></>,
                    loader: () => redirect("faculty"),
                  },
                  {
                    path: "faculty",
                    element: <FacultyTab />,
                    loader: adminDashboardFacultyLoader,
                  },
                  {
                    path: "students",
                    element: <StudentsTab />,
                    loader: adminDashboardStudentsLoader,
                  },
                  {
                    path: "courses",
                    element: <CoursesTab />,
                    loader: adminDashboardCoursesLoader,
                    action: deleteCourseAction
                  },
                  {
                    path: "faculty/:facultyId",
                    element: <AdminFacultyDetailPage />,
                    loader: facultyDetailLoader,
                  },
                  {
                    path: "faculty/:facultyId/:courseId",
                    element: <AdminFacultyStatistics />,
                    loader: adminCourseStatisticsLoader,
                  },
                  { path: "addStudentsCSV", action: addStudentsAction, element: <></> },
                  { path: "addFacultyCSV", action: addFacultyAction, element: <></> },
                  { path: "addcourse", action: addCourseAction, element: <></> },
                ],
              },
              {
                path: "faculty",
                children: [
                  {
                    index: true,
                    loader: facultyFeedbackLoader,
                    element: <FacultyDashboard />,
                  },
                  {
                    path: ":courseId",
                    loader: facultyViewStatsLoader,
                    element: <FacultyStatistics />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "people",
        loader: checkAuthLoader,
        children: [{ path: ":smth", element: <Temp /> }],
      },
      {
        path: "settings",
        element: <Temp />,
        loader: checkAuthLoader,
      },
      {
        path: "auth",
        element: <Authentication />,
        action: authAction,
      },
      {
        path: "logout",
        action: logoutAction,
      },
    ],
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
