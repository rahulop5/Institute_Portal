import React, { useState } from "react";
import courseImg from "../../../../assets/math1.png";
import facultyImg from "../../../../assets/studenticon.svg";
import styles from "../styles/formpage.module.css";

const questionBank = [
  { id: 1, text: "The faculty explained concepts clearly." },
  { id: 2, text: "The faculty was approachable for doubts." },
  { id: 3, text: "The pace of teaching was appropriate." },
  { id: 4, text: "The faculty encouraged student participation." },
  { id: 5, text: "The faculty used examples and case studies effectively." },
  { id: 6, text: "The evaluation methods (assignments/tests) were fair." },
  { id: 7, text: "The faculty provided constructive feedback." },
  { id: 8, text: "The lectures were well-structured and organized." },
  { id: 9, text: "The faculty motivated students to learn." },
  { id: 10, text: "The faculty demonstrated good subject knowledge." },
  { id: 11, text: "The faculty encouraged critical thinking." },
  { id: 12, text: "The use of teaching aids (slides/board) was effective." },
  { id: 13, text: "The faculty managed the class time effectively." },
  { id: 14, text: "The faculty connected theory with practical applications." },
  { id: 15, text: "Overall, I am satisfied with the teaching." },
];

const feedbackData = {
  studentId: "STU123",
  courses: [
    {
      courseId: "CSE101",
      courseName: "Data Structures and Algorithms",
      faculties: [
        { facultyId: "FAC123", facultyName: "Dr. Anjali Sharma" },
        { facultyId: "FAC124", facultyName: "Prof. Rajesh Kumar" },
      ],
    },
    {
      courseId: "MAT201",
      courseName: "Linear Algebra",
      faculties: [{ facultyId: "FAC201", facultyName: "Dr. Priya Menon" }],
    },
  ],
};

export default function FormPage() {
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [currentFacultyIndex, setCurrentFacultyIndex] = useState(0);

  const [responses, setResponses] = useState({});
  const [facultyFeedback, setFacultyFeedback] = useState("");
  const [courseFeedback, setCourseFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const currentCourse = feedbackData.courses[currentCourseIndex];
  const currentFaculty = currentCourse.faculties[currentFacultyIndex];

  const handleClick = (qId, value) => {
    setResponses((prev) => ({
      ...prev,
      [qId]: value,
    }));
  };

  const handleNext = async () => {
    setSubmitted(true);

    const unanswered = questionBank.filter((q) => !responses[q.id]);
    if (unanswered.length > 0) {
      const firstUnanswered = document.getElementById(
        `question-${unanswered[0].id}`
      );
      if (firstUnanswered) {
        firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

   
    const payload = {
      studentId: feedbackData.studentId,
      courseId: currentCourse.courseId,
      facultyId: currentFaculty.facultyId,
      responses,
      facultyFeedback,
      courseFeedback,
    };

    console.log("Submitting payload to backend:", payload);

    // TODO: Implement actual backend POST request here
    setResponses({});
    setFacultyFeedback("");
    setCourseFeedback("");
    setSubmitted(false);

    
    if (currentFacultyIndex + 1 < currentCourse.faculties.length) {
      setCurrentFacultyIndex(currentFacultyIndex + 1);
    } else if (currentCourseIndex + 1 < feedbackData.courses.length) {
      setCurrentCourseIndex(currentCourseIndex + 1);
      setCurrentFacultyIndex(0);
    } else {
      alert("All feedback completed! Thank you.");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={styles.maincontainer}>
      <h1>Feedback Form</h1>

      <div className={styles.coursedetails}>
        <div className={styles.description}>
          <p>
            Please answer sincerely. Honest feedback ensures that we can make
            the right changes where needed.
          </p>
        </div>

        <div className={styles.coursecontainer}>
          <div className={styles.course}>
            <div className={styles.courseimg}>
              <img src={courseImg} alt="Course" />
            </div>
            <div className={styles.coursename}>
              <h2>{currentCourse.courseName}</h2>
            </div>
          </div>

          <div className={styles.extrainfo}>
            <div className={styles.coursenumber}>
              <p>{currentCourse.courseId}</p>
            </div>

            <div className={styles.facultyname}>
              <div className={styles.facultyimg}>
                <img src={facultyImg} alt="" />
              </div>
              <div className={styles.facultyinfo}>
                <p>Faculty:</p>
                <p>{currentFaculty.facultyName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formcontainer}>
        {questionBank.map((question) => (
          <div
            key={question.id}
            id={`question-${question.id}`}
            className={`${styles.questionBlock} ${
              submitted && !responses[question.id] ? styles.unanswered : ""
            }`}
          >
            <div>
              <p className={styles.questionNumber}>{question.id}</p>
            </div>
            <div>
              <p className={styles.questionText}>{question.text}</p>
              <div className={styles.buttonRow}>
                {[...Array(10)].map((_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={
                        responses[question.id] === value
                          ? styles[`btn${value}Selected`]
                          : styles[`btn${value}`]
                      }
                      onClick={() => handleClick(question.id, value)}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div className={styles.suggestionsBox}>
          <h4>Feedback & Suggestions on the Faculty:</h4>
          <textarea
            value={facultyFeedback}
            onChange={(e) => setFacultyFeedback(e.target.value)}
          />
        </div>

        <div className={styles.suggestionsBox}>
          <h4>Feedback & Suggestions on the Course:</h4>
          <textarea
            value={courseFeedback}
            onChange={(e) => setCourseFeedback(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.submitContainer}>
        <button
          type="button"
          className={styles.proceedButton}
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
