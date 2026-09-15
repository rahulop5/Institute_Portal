import { useSubmit, useNavigation, redirect } from "react-router";
import styles from "../../../styles/TopicSelection.module.css";
import studentIcon from "../../../../assets/studenticon.svg";
import { API_HOST } from "../../../../config";

export default function TopicSelection({ data }) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handleRequest = (topicDocId, topicId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ topicDocId, topicId }));
    submit(formData, {
      method: "post",
      action: "requesttopic",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleWithdraw = (topicDocId, topicId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ topicDocId, topicId }));
    submit(formData, {
      method: "post",
      action: "withdrawrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Select a BTP Topic</h1>

      {data.topics.length === 0 ? (
        <p className={styles.empty}>No topics have been posted yet.</p>
      ) : (
        data.topics.map((facultyTopics) => (
          <div key={facultyTopics._id} className={styles.facultyCard}>
            <div className={styles.facultyHeader}>
              <img src={studentIcon} alt="" className={styles.facultyIcon} />
              <span className={styles.facultyName}>{facultyTopics.faculty?.name}</span>
              <span className={styles.facultyDept}>{facultyTopics.faculty?.dept}</span>
            </div>

            {facultyTopics.topics.map((t) => (
              <div key={t._id} className={styles.topicRow}>
                <div className={styles.topicInfo}>
                  <div className={styles.topicTitle}>{t.topic}</div>
                  <div className={styles.topicAbout}>{t.about}</div>
                </div>

                <div className={styles.topicAction}>
                  {t.requestStatus === "Pending" && (
                    <>
                      <span className={styles.badgePending}>Pending</span>
                      <button
                        className={styles.withdrawBtn}
                        disabled={isSubmitting}
                        onClick={() => handleWithdraw(facultyTopics._id, t._id)}
                      >
                        Withdraw
                      </button>
                    </>
                  )}
                  {t.requestStatus === "Rejected" && (
                    <>
                      <span className={styles.badgeRejected}>Rejected</span>
                      <button
                        className={styles.withdrawBtn}
                        disabled={isSubmitting}
                        onClick={() => handleWithdraw(facultyTopics._id, t._id)}
                      >
                        Clear
                      </button>
                    </>
                  )}
                  {!t.requestStatus && (
                    <button
                      className={styles.requestBtn}
                      disabled={isSubmitting}
                      onClick={() => handleRequest(facultyTopics._id, t._id)}
                    >
                      Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export async function action({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/student/btp/requesttopic", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Response(
      JSON.stringify({ message: result.message || "Error requesting topic" }),
      { status: response.status }
    );
  }

  return redirect("/academics/btp/student");
}

export async function action2({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/student/btp/withdrawrequest", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Response(
      JSON.stringify({ message: result.message || "Error withdrawing request" }),
      { status: response.status }
    );
  }

  return redirect("/academics/btp/student");
}
