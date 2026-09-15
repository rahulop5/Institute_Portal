import { useState } from "react";
import styles from "../../../styles/Requests.module.css";
import studentIcon from "../../../../assets/studenticon.svg";
import { useSubmit, redirect } from "react-router";
import nothing from "../../../../assets/Group 421.png";
import { API_HOST } from "../../../../config";

function Requests({ data }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const submit = useSubmit();

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleAccept = (studentId, topicId) => {
    const payload = { studentId, topicId };
    const formData = new FormData();
    formData.append("reqData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "accepttopicrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleReject = (studentId, topicId) => {
    const payload = { studentId, topicId, docid: data.topics._id };
    const formData = new FormData();
    formData.append("reqData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "rejecttopicrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  // A request is removed from BTPTopic.requests as soon as it's approved or
  // rejected (see facultybtpController.js), so everything here is pending.
  const pendingRequests = data.topics?.requests || [];

  return (
    <div className={styles.container}>
      {pendingRequests.length === 0 ? (
        <div className={styles.emptycontainer}>
          <div>
            <img src={nothing} alt="" />
          </div>
          <div>
            <p className={styles.empty}>No pending requests.</p>
          </div>
        </div>
      ) : (
        pendingRequests.map((req, index) => {
          const student = req.student;
          const topic = req.topicDetails;

          return (
            <div key={index} className={styles.card}>
              <div className={styles.row}>
                <div className={styles.bin1name}>
                  <div className={styles.teamicon}>
                    <img src={studentIcon} alt="student" />
                  </div>
                  <div className={styles.name}>{student?.name || "Unknown"}</div>
                </div>
                <div className={styles.topic}>{topic?.topic || "Topic no longer available"}</div>
                <button
                  className={styles.moreInfo}
                  onClick={() => handleToggle(index)}
                >
                  {expandedIndex === index ? "Less info" : "More info"}
                </button>
              </div>

              {expandedIndex === index && (
                <div className={styles.expanded}>
                  <p>
                    <strong>Roll Number:</strong> <br />
                    {student?.rollNumber || "-"}
                  </p>
                  <p>
                    <strong>Email:</strong> <br />
                    {student?.email || "-"}
                  </p>
                  {topic?.about && (
                    <p>
                      <strong>About:</strong> <br />
                      {topic.about}
                    </p>
                  )}
                  <div className={styles.actions}>
                    <button
                      className={styles.reject}
                      onClick={() => handleReject(student._id, req.topic)}
                    >
                      Reject
                    </button>
                    <button
                      className={styles.accept}
                      onClick={() => handleAccept(student._id, req.topic)}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Requests;

export async function action({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(
    API_HOST + "/faculty/btp/approvetopicrequest",
    {
      method: "post",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: reqdata,
    }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Error accepting the request",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();

  return redirect("/academics/btp");
}

export async function action2({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(
    API_HOST + "/faculty/btp/rejecttopicreq",
    {
      method: "delete",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: reqdata,
    }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Error rejecting the request",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();

  return redirect("/academics/btp");
}
