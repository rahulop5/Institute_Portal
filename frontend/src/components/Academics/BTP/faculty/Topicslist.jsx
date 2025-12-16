import React, { useState, useRef, useEffect, use } from "react";
import styles from "../../../styles/Topicslist.module.css";
import { Form, redirect, useNavigation, useSubmit } from "react-router";
import { API_HOST } from "../../../../config";

function TopicList({ topics, onDelete, actid }) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const expandedRef = useRef(null);
  const navigation = useNavigation();
  const submit=useSubmit();

  const handleToggle = (index) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleDelete = (topicid) => {
    const payload = {
      topicid: topicid,
      actualtid: actid
    };
    const formData = new FormData();
    formData.append("topicData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "deletetopic",
      encType: "application/x-www-form-urlencoded",
    });
  };

  useEffect(() => {
    if (navigation.state === "idle") {
      setShowModal(false);
      setNewTitle("");
      setNewDescription("");
    }
  }, [navigation.state]);

  useEffect(() => {
    if (expandedRef.current) {
      expandedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [expandedIndex]);

  return (
    <>
      {/* Topic List Section */}
      <section
        className={`${styles.container} ${showModal ? styles.blurred : ""}`}
      >
        <header className={styles.header}>
          <div>Topic</div>
          <div>Topic ID</div>
        </header>

        <div className={`${styles.scrollContainer} scrollContainer`}>
          {topics.map(([title, description, id], index) => (
            <article key={index} className={styles.topicCard}>
              <div className={styles.topicRow}>
                <div className={styles.topicTitle}>{title}</div>
                <div className={styles.topicActions}>
                  <span className={styles.topicId}>{id}</span>
                  <button
                    onClick={() => handleToggle(index)}
                    className={styles.toggleBtn}
                    aria-expanded={expandedIndex === index}
                  >
                    {expandedIndex === index ? "Less info" : "More info"}
                  </button>
                </div>
              </div>

              <div
                ref={expandedIndex === index ? expandedRef : null}
                className={`${styles.expanded} ${
                  expandedIndex === index ? styles.expandedVisible : ""
                }`}
              >
                <p className={styles.topicdescrption}>{description}</p>
                <div className={styles.deleteActions}>
                  <span className={styles.warning}>
                    ⚠️ Topic deletion triggers topic reset for selected teams.
                  </span>
                  <button
                    onClick={() => handleDelete(id)}
                    className={styles.deleteBtn}
                  >
                    Delete Topic
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Add Topic Button (Outside the List Section) */}
      <div className={styles.addTopicContainer}>
        <button
          className={styles.addTopicBtn}
          onClick={() => setShowModal(true)}
        >
          Add Topic
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <Form className={styles.modal} method="post" action="addTopic">
            <h2>Add a topic</h2>

            <label>
              Topic title:
              <span className={styles.limit}>⚠️ 150 Character limit.</span>
              <input
                type="text"
                placeholder="Type here..."
                name="topic"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </label>

            <label>
              Topic description:
              <span className={styles.limit}>⚠️ 500 Character limit.</span>
              <textarea
                placeholder="Type here..."
                name="about"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </label>

            <button
              className={styles.confirmBtn}
              disabled={navigation.state === "submitting"}
            >
              {navigation.state === "submitting" ? "Adding..." : "Confirm"}
            </button>
          </Form>
        </div>
      )}
    </>
  );
}

export default TopicList;

export async function action({ request }) {
  const formData = await request.formData();
  const topic = formData.get("topic");
  const about = formData.get("about");
  const token = localStorage.getItem("token");

  const reqdata = {
    topic: topic,
    about: about,
  };

  const response = await fetch(API_HOST + "/faculty/btp/addtopic", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqdata),
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Response(
      JSON.stringify({
        message: "Error adding the topic",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();

  return redirect("/academics/btp");
}

export async function action2({request}){
  const token=localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata=formData.get("topicData");

  const response = await fetch(API_HOST + "/faculty/btp/deletetopic", {
    method: "delete",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Response(
      JSON.stringify({
        message: "Error adding the topic",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();

  return redirect("/academics/btp");
}
