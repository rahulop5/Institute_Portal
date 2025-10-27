import folder from "../../../../assets/googleforms.png";
import info from "../../../../assets/info.png";
import calendar from "../../../../assets/calendar.png";
import clock from "../../../../assets/clock.png";
import styles from "../styles/startpage.module.css";

export default function StartPage() {
  const feedbackData = {
    isOpen: false, 
    isFilled: true,
    deadline: {
      date: "March 31, 2023",
      time: "23:59 Hrs (IST)",
    },
  };

  return (
    <div className={styles.startpage}>
      <h1>Feedback Form</h1>

      <div className={styles.total}>
       
        <div className={styles.container}>
          <div className={styles.heading}>
            <div>
              <h1>Why Feedback?</h1>
            </div>
            <div className={styles.googleform}>
              <img src={folder} alt="Formimage" />
            </div>
          </div>

          <div className={styles.description}>
            <p>
              Your feedback plays a key role in improving the overall
              teaching-learning process. By sharing your honest thoughts, you
              help us identify strengths, address areas for improvement, and
              ensure a more engaging and effective learning environment.
            </p>
          </div>

          <div className={styles.instruction}>
            <div>
              <img src={info} alt="inforbutton" />
            </div>
            <div>
              <p>
                Every response is kept <strong>strictly confidential</strong>{" "}
                and will be used only to enhance academic quality, teaching
                methods, and student experience.
              </p>
            </div>
          </div>
        </div>

      
        <div className={styles.deadlinecontainer}>
          <h2>Deadline:</h2>

          <div className={styles.deadline}>
            
            <div className={styles.datewrapper}>
              <div className={styles.dateimage}>
                <img src={calendar} alt="calendar" />
              </div>
              <div className={styles.date}>
                <h3>Date:</h3>
                <p>
                  <strong>{feedbackData.isOpen ? feedbackData.deadline.date : ""}</strong>
                </p>
              </div>
            </div>

     
            <div className={styles.datewrapper}>
              <div className={styles.dateimage}>
                <img src={clock} alt="clock" />
              </div>
              <div className={styles.time}>
                <h3>Time:</h3>
                <p>
                  <strong>{feedbackData.isOpen ? feedbackData.deadline.time : ""}</strong>
                </p>
              </div>
            </div>
          </div>

       
          {feedbackData.isOpen ? (
            <button
              disabled={feedbackData.isFilled}
              className={`${styles.startbutton} ${
                feedbackData.isFilled ? styles.disabledbutton : ""
              }`}
            >
              {feedbackData.isFilled ? "Already Filled" : "Fill Out Now"}
            </button>
          ) : (
            <button disabled className={styles.noformbutton}>
              Form Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
