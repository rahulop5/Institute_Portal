import FacultySelection from "./Facultyselection";
import FormPage from "./formpage";
import StartPage from "./startpage";

export default function FeedbackDashboardStudent() {
    // Sample data for demonstration
  const data = {
    email: "ananya.g25@iiits.in",
    started: false,
    submitted: false
  };
  return (
    <div>
        {!data.started && !data.submitted && (
            <div>
                <FacultySelection />
            </div>
        )}

        {data.started && !data.submitted && (
            <div>
               <FormPage />
            </div>
        )}      
        {data.submitted && (
            <div>
              <StartPage />
            </div>
        )}
    </div>
  );
}
