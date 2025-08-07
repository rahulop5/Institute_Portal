import React, { useState } from "react";
import styles from "../../../styles/Requests.module.css";
import studentIcon from "../../../../assets/studenticon.svg";
import { useSubmit, redirect } from "react-router";

function Requests({ data }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const submit = useSubmit();

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleAccept = (teamid, topicid) => {
    const payload = {
      topicid: topicid,
      teamid: teamid,
    };
    const formData = new FormData();
    formData.append("reqData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "accepttopicrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleReject = (teamid, topicid) => {
    const docid=data.topics._id;
    const payload = {
      topicid: topicid,
      teamid: teamid,
      docid: docid
    };
    const formData = new FormData();
    formData.append("reqData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "rejecttopicrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  // Use only unapproved requests
  const pendingRequests = data.topics.requests.filter((req) => !req.isapproved);
  const acceptedrequests=data.topics.requests.filter((req) => req.isapproved)

  return (
    <>
    <div className={styles.container}>
      {pendingRequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        pendingRequests.map((req, index) => {
          const team = req.teamid;
          const topic = req.topicDetails;

          return (
            <div key={index} className={styles.card}>
              <div className={styles.row}>
                <div className={styles.bin1name}>
                  <div className={styles.teamicon}>
                    <img src={studentIcon} alt="student" />
                  </div>
                  <div className={styles.name}>{team.bin1.student.name}</div>
                </div>
                <div className={styles.topic}>{topic.topic}</div>
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
                    {team.bin1.student.rollno}
                  </p>
                  <div className={styles.teamlist}>
                    <div className={styles.team}>
                      Team: <br />
                    </div>
                    <div className={styles.icons}>
                      <div
                        className={styles.icon}
                        title={team.bin2.student.name}
                      >
                        <img src={studentIcon} alt="student" />
                      </div>
                      <div
                        className={styles.icon}
                        title={team.bin3.student.name}
                      >
                        <img src={studentIcon} alt="student" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.reject}
                      onClick={() => handleReject(team._id, topic._id)}
                    >
                      Reject
                    </button>
                    <button
                      className={styles.accept}
                      onClick={() => handleAccept(team._id, topic._id)}
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
    {/* ikkada accepted requests ki styles */}
    <h2>Accepted Requests</h2>
    <div className={styles.container}>
      {acceptedrequests.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        acceptedrequests.map((req, index) => {
          const team = req.teamid;
          const topic = req.topicDetails;

          return (
            <div key={index} className={styles.card}>
              <div className={styles.row}>
                <div className={styles.bin1name}>
                  <div className={styles.teamicon}>
                    <img src={studentIcon} alt="student" />
                  </div>
                  <div className={styles.name}>{team.bin1.student.name}</div>
                </div>
                <div className={styles.topic}>{topic.topic}</div>
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
                    {team.bin1.student.rollno}
                  </p>
                  <div className={styles.teamlist}>
                    <div className={styles.team}>
                      Team: <br />
                    </div>
                    <div className={styles.icons}>
                      <div
                        className={styles.icon}
                        title={team.bin2.student.name}
                      >
                        <img src={studentIcon} alt="student" />
                      </div>
                      <div
                        className={styles.icon}
                        title={team.bin3.student.name}
                      >
                        <img src={studentIcon} alt="student" />
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.reject}
                      onClick={() => handleReject(team._id, topic._id)}
                    >
                      Reject
                    </button>
                    <button
                      className={styles.accept}
                      onClick={() => handleAccept(team._id, topic._id)}
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
    </>
  );
}

export default Requests;

export async function action({ request }) {
  const token=localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata=formData.get("reqData");

  const response = await fetch("http://localhost:3000/faculty/btp/approvetopicrequest", {
    method: "post",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

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
  console.log(result)

  return redirect("/academics/btp");
}

export async function action2({ request }) {
  const token=localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata=formData.get("reqData");

  const response = await fetch("http://localhost:3000/faculty/btp/rejecttopicreq", {
    method: "delete",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

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