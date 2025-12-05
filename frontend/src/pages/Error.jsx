import { useRouteError, Link } from "react-router-dom";
import styles from "../components/styles/ErrorPage.module.css";

// Import the background template
// Adjust the path if your ErrorPage.jsx is not in the /pages folder
import errorBackground from "../assets/error_page_template.png"

export default function ErrorPage() {
  const error = useRouteError();

  let status = "Oops!";
  let message = "Something went wrong!";

  if (error.status) {
    status = error.status;
  }

  // Try to extract message from various formats
  if (error.data) {
    // If error.data is a string (likely JSON), try to parse it
    if (typeof error.data === 'string') {
      try {
        const parsedData = JSON.parse(error.data);
        if (parsedData.message) {
          message = parsedData.message;
        }
      } catch (e) {
        // If parsing fails, use the string as-is
        message = error.data;
      }
    } 
    // If error.data is already an object
    else if (error.data.message) {
      message = error.data.message;
    }
  } else if (error.statusText) {
    message = error.statusText;
  } else if (error.message) {
    message = error.message;
  }

  // A specific message for 404
  if (error.status === 404) {
    message = "The page you are looking for is missing... If you think something is broken, report a problem.";
  }

  return (
    <div
      className={styles.errorWrapper}
      style={{ backgroundImage: `url(${errorBackground})` }}
    >
      <div className={styles.errorContent}>
        <h1 className={styles.errorCode}>{status}</h1>
        <p className={styles.errorMessage}>{message}</p>
        <Link to="/" className={styles.homeButton}>
          Go Home
        </Link>
      </div>
    </div>
  );
}