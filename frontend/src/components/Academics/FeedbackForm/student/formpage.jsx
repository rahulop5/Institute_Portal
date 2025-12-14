import { useState } from "react";
import courseImg from "../../../../assets/math1.png";
import facultyImg from "../../../../assets/studenticon.svg";
import styles from "../styles/formpage.module.css";
import { useSubmit, redirect } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

import { API_HOST } from "../../../../config";

export default function FormPage({ feedback }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const submit = useSubmit();
  const [submitted, setSubmitted] = useState(false);

  // Store responses as an ARRAY of pages instead of object
  const [responses, setResponses] = useState(() =>
    feedback.feedbacks.map((fb) => ({
      courseId: fb.course._id,
      facultyId: fb.faculty._id,
      answers: fb.answers.reduce((acc, ans) => {
        acc[ans.question._id] = ans.response ?? null;
        return acc;
      }, {}),
    }))
  );

  const currentPage = responses[currentIndex];
  const currentFeedback = feedback.feedbacks[currentIndex];
  const course = currentFeedback.course;
  const faculty = currentFeedback.faculty;
  const questions = currentFeedback.answers.map((a) => a.question);

  const handleRatingClick = (qId, value) => {
    setResponses((prev) =>
      prev.map((page, i) =>
        i === currentIndex
          ? { ...page, answers: { ...page.answers, [qId]: value } }
          : page
      )
    );
  };

  const handleTextChange = (qId, value) => {
    setResponses((prev) =>
      prev.map((page, i) =>
        i === currentIndex
          ? { ...page, answers: { ...page.answers, [qId]: value } }
          : page
      )
    );
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Replaced alert with console.warn or a non-blocking UI notification
      console.warn("You are already at the first faculty.");
    }
  };

  const handleNext = () => {
    setSubmitted(true);

    const currentResponses = currentPage.answers;
    const unanswered = questions.filter(
      (q) => !currentResponses[q._id] && q.type === "rating"
    );

    // Scroll to first unanswered rating
    if (unanswered.length > 0) {
      const firstUnanswered = document.getElementById(
        `question-${unanswered[0]._id}`
      );
      if (firstUnanswered) {
        firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // Just move to next page (no backend call)
    if (currentIndex + 1 < feedback.feedbacks.length) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Replaced alert with console.info or a non-blocking UI notification
      console.info("All feedback completed! You can now save your progress.");
    }

    setSubmitted(false);
  };

  const handleSaveProgress = async () => {
    const payload = {
      currentPage: currentIndex + 1,
      feedbacks: responses.map((page) => ({
        courseId: page.courseId,
        facultyId: page.facultyId,
        answers: Object.entries(page.answers).map(([question, response]) => ({
          question,
          response,
        })),
      })),
    };

    const formData = new FormData();
    formData.append("reqData", JSON.stringify(payload));

    submit(formData, {
      method: "post",
      action: "updatefeedback",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    // Check all pages for unanswered rating questions
    let firstUnansweredPage = -1;
    let firstUnansweredQuestionId = null;

    for (let i = 0; i < responses.length; i++) {
      const page = responses[i];
      const fb = feedback.feedbacks[i];
      const unanswered = fb.answers.filter(
        (a) => !page.answers[a.question._id] && a.question.type === "rating"
      );

      if (unanswered.length > 0) {
        firstUnansweredPage = i;
        firstUnansweredQuestionId = unanswered[0].question._id;
        break;
      }
    }

    // If any unanswered rating found → go to that page and scroll
    if (firstUnansweredPage !== -1) {
      setCurrentIndex(firstUnansweredPage);
      setTimeout(() => {
        const element = document.getElementById(
          `question-${firstUnansweredQuestionId}`
        );
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200); // Small delay to ensure state update and re-render
      return;
    }

    // Show confirmation dialog before submitting
    Swal.fire({
      title: 'Are you sure you want to submit?',
      text: "You won't be able to change your responses after submission!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Everything answered → proceed with submission
        const payload = {
          currentPage: currentIndex + 1,
          feedbacks: responses.map((page) => ({
            courseId: page.courseId,
            facultyId: page.facultyId,
            answers: Object.entries(page.answers).map(([question, response]) => ({
              question,
              response,
            })),
          })),
        };

        const formData = new FormData();
        formData.append("reqData", JSON.stringify(payload));

        submit(formData, {
          method: "post",
          action: "submitfeedback",
          encType: "application/x-www-form-urlencoded",
        });

        toast.success("Form submitted successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setSubmitted(false);
      } else {
        setSubmitted(false);
      }
    });
  };

  const currentResponses = currentPage.answers;

  return (
    <div className={styles.maincontainer}>
      <h1>Feedback Form</h1>


      <div className={styles.coursedetails}>
        <div className={styles.description}>
          <p>
            Please answer sincerely. Honest feedback helps improve teaching
            quality and learning experience.
          </p>
        </div>

        <div className={styles.coursecontainer}>
          <div className={styles.course}>
            <div className={styles.courseimg}>
              <img src={courseImg} alt="Course" />
            </div>
            <div className={styles.coursename}>
              <h2>{course.name}</h2>
            </div>
          </div>

          <div className={styles.extrainfo}>
            <div className={styles.coursenumber}>
              <p>{course.code}</p>
            </div>

            <div className={styles.facultyname}>
              <div className={styles.facultyimg}>
                <img src={facultyImg} alt="Faculty" />
              </div>
              <div className={styles.facultyinfo}>
                <p>Faculty:</p>
                <p>{faculty.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Feedback Questions --- */}
      <div className={styles.formcontainer}>
        {questions.map((q) => (
          <div
            key={q._id}
            id={`question-${q._id}`}
            className={`${styles.questionBlock} ${
              submitted && !currentResponses[q._id] && q.type === "rating"
                ? styles.unanswered
                : ""
            }`}
          >
            <div>
              <p className={styles.questionNumber}>{q.order}</p>
            </div>

            <div className={styles.questionContent}>
              <p className={styles.questionText}>{q.text}</p>

              {q.type === "rating" ? (
                <div className={styles.buttonRow}>
                  {[...Array(10)].map((_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={
                          currentResponses[q._id] === value
                            ? styles[`btn${value}Selected`]
                            : styles[`btn${value}`]
                        }
                        onClick={() => handleRatingClick(q._id, value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.suggestionsBox}>
                  <textarea
                    value={currentResponses[q._id] || ""}
                    onChange={(e) => handleTextChange(q._id, e.target.value)}
                    placeholder="Write your feedback here..."
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.submitContainer}>
        {/* Back button */}
        <div>
          <button
            type="button"
            className={styles.proceedButton}
            onClick={handleSaveProgress}
          >
            Save Progress
          </button>
        </div>
        <div className={styles.navigatebtns}>
          <button
            type="button"
            className={styles.proceedButton}
            onClick={handleBack}
            disabled={currentIndex === 0}
            style={{
              opacity: currentIndex === 0 ? 0.5 : 1,
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>
          {/* Conditional Next / Submit button */}
          {currentIndex + 1 < feedback.feedbacks.length ? (
            <button
              type="button"
              className={styles.proceedButton}
              onClick={handleNext}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export async function nextAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const pageDataJSON = formData.get("reqData");
  const data = JSON.parse(pageDataJSON);
  // console.log(data);

  const response = await fetch(
    API_HOST + "/student/feedback/updatefeedback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    console.log(err);

    throw new Response(
      JSON.stringify({
        message: err.message || "Failed to submit faculty selection",
      }),
      { status: response.status || 500 }
    );
  }
  const res = await response.json();
  console.log(res);

  return redirect("/academics/feedback/student"); // adjust as needed
}

export async function submitAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const pageDataJSON = formData.get("reqData");
  const data = JSON.parse(pageDataJSON);
  // console.log(data);

  const response = await fetch(
    API_HOST + "/student/feedback/submitfeedback",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    console.log(err);

    throw new Response(
      JSON.stringify({
        message: err.message || "Failed to submit faculty selection",
      }),
      { status: response.status || 500 }
    );
  }
  const res = await response.json();
  console.log(res);

  return redirect("/academics/feedback/student"); // adjust as needed
}
