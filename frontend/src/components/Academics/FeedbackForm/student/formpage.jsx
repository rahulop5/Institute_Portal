import React, { useEffect, useState } from "react";
import courseImg from "../../../../assets/math1.png";
import facultyImg from "../../../../assets/studenticon.svg";
import styles from "../styles/formpage.module.css";

export default function FormPage({ feedback }) {
  console.log("📦 Received feedback data:", feedback);

  // Extract data from backend
  const { feedbacks = [], student, _id: feedbackInstanceId } = feedback || {};

  // Track current course and faculty being filled
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFeedback = feedbacks[currentIndex];

  // Local states for responses and remarks
  const [responses, setResponses] = useState({});
  const [facultyFeedback, setFacultyFeedback] = useState("");
  const [courseFeedback, setCourseFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load saved progress (if any)
  useEffect(() => {
    if (currentFeedback?.answers?.length > 0) {
      const savedResponses = {};
      currentFeedback.answers.forEach((ans) => {
        if (ans.question && ans.response !== undefined) {
          savedResponses[ans.question._id] = ans.response;
        }
      });
      setResponses(savedResponses);
      setFacultyFeedback(currentFeedback.facultyFeedback || "");
      setCourseFeedback(currentFeedback.courseFeedback || "");
    } else {
      setResponses({});
      setFacultyFeedback("");
      setCourseFeedback("");
    }
  }, [currentIndex, feedback]);

  // Handle clicking on a rating button
  const handleClick = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Submit and save progress
  const handleNext = async () => {
    setSubmitted(true);

    // Validate unanswered
    const unanswered = currentFeedback.answers.filter(
      (ans) => responses[ans.question._id] === undefined
    );
    if (unanswered.length > 0) {
      const firstUnanswered = document.getElementById(
        `question-${unanswered[0].question._id}`
      );
      if (firstUnanswered) {
        firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const payload = {
      feedbackInstanceId,
      feedbackId: currentFeedback._id,
      responses,
      facultyFeedback,
      courseFeedback,
    };

    console.log("📤 Submitting payload:", payload);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/student/feedback/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      console.log("✅ Progress saved:", result);
    } catch (err) {
      console.error("🔥 Failed to save progress:", err);
    }

    // Move to next course/faculty feedback
    if (currentIndex + 1 < feedbacks.length) {
      setCurrentIndex(currentIndex + 1);
      setSubmitted(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("🎉 All feedback completed! Thank you.");
    }
  };

  // Safety check
  if (!currentFeedback) {
    return <p>Loading feedback form...</p>;
  }

  const course = currentFeedback.course;
  const faculty = currentFeedback.faculty;
  const questions = currentFeedback.answers.map((ans) => ans.question);

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
              <h2>{course.name}</h2>
            </div>
          </div>

          <div className={styles.extrainfo}>
            <div className={styles.coursenumber}>
              <p>{course.code}</p>
            </div>

            <div className={styles.facultyname}>
              <div className={styles.facultyimg}>
                <img src={facultyImg} alt="" />
              </div>
              <div className={styles.facultyinfo}>
                <p>Faculty:</p>
                <p>{faculty.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className={styles.formcontainer}>
        {questions.map((question, idx) => (
          <div
            key={question._id}
            id={`question-${question._id}`}
            className={`${styles.questionBlock} ${
              submitted && !responses[question._id] ? styles.unanswered : ""
            }`}
          >
            <div>
              <p className={styles.questionNumber}>{idx + 1}</p>
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
                        responses[question._id] === value
                          ? styles[`btn${value}Selected`]
                          : styles[`btn${value}`]
                      }
                      onClick={() => handleClick(question._id, value)}
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
          {currentIndex + 1 < feedbacks.length ? "Next" : "Submit All"}
        </button>
      </div>
    </div>
  );
}
