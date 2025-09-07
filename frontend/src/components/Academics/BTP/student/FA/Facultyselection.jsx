import { useState } from "react";
import { redirect, useSubmit } from "react-router";
import FacultyList from "./FSlist";
import TopicCards from "./FStopiclist";
import RequestList from "./Requestlist";
import ApprovedCard from "./ApprovedCard";
import studentIcon from "../../../../../assets/studenticon.svg";
import FSTeamthere from "./FSTeamshow";
import classes from "../../../../styles/FacultySelection.module.css";
import PreferenceOrder from "./PreferenceOrder";
import TFTeamthereBin1 from "../TF/TFTeamthereBin1";

export default function FacultySelection({ data }) {
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedFacultyTopics, setSelectedFacultyTopics] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [preferences, setPreferences] = useState([null, null, null, null]);
  const [currentPrefIndex, setCurrentPrefIndex] = useState(0);
  const submit = useSubmit();

  const handleShowTopics = (facultyObj) => {
    setSelectedFaculty(facultyObj.faculty); // store faculty info
    setSelectedFacultyTopics((prevfacobj) => {
      if (prevfacobj === facultyObj.topics) {
        return null;
      }
      return facultyObj.topics;
    });
  };

  const handleToggleRequests = () => {
    setShowRequests((prev) => (prev ? false : true));
  };

  const handleApply = (topic) => {
    const teamId = data.team._id;
    const topicId = topic._id;
    const parent = data.topics.find((t) =>
      t.topics.some((tp) => tp._id === topicId)
    );
    const docId = parent?._id;
    //handle this error later using router
    if (!docId || !topicId || !teamId) {
      console.error("Missing one of the required fields");
      return;
    }
    const alreadyRequested = data.outgoingRequests.some(
      (req) => req.requestedTopic._id === topicId
    );

    if (alreadyRequested) {
      alert("You have already applied to this topic.");
      return;
    }

    const payload = {
      docId,
      topicId,
      teamId,
    };
    const formData = new FormData();
    formData.append("topicData", JSON.stringify(payload));
    submit(formData, {
      method: "post",
      action: "applytotopic",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const approvedRequest = data.outgoingRequests.find((r) => r.isapproved);

  const handleAddPreference = (topic) => {
    if (currentPrefIndex < 4) {
      const updated = [...preferences];
      updated[currentPrefIndex] = {
        title: topic.topic, // ✅ correct field
        description: topic.about, // ✅ correct field
        facultyName: selectedFaculty?.name, // ✅ comes from selected faculty
        topicId: topic._id, // ✅ backend id
      };
      setPreferences(updated);
      setCurrentPrefIndex(currentPrefIndex + 1);
    }
  };

  const handleDeletePreference = (index) => {
    const updated = [...preferences];
    updated.splice(index, 1); // remove selected
    updated.push(null); // maintain 4 slots
    setPreferences(updated);
    setCurrentPrefIndex(updated.findIndex((p) => !p)); // first empty slot
  };

  const handleFinalize = async () => {
    const payload = {
      teamId: "T123",
      preferences: preferences.filter((p) => p !== null),
    };

    await fetch("/student/btp/finalizepreferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Finalized:", payload);
  };

  return (
    <>
      {/* Faculty assigned */}
      {data.facultyassigned && approvedRequest ? (
        <ApprovedCard request={approvedRequest} />
      ) : (
        <>
          {/* Faculty not yet assigned */}
          <FacultyList
            faculties={data.topics}
            onShowTopics={handleShowTopics}
          />

          <PreferenceOrder
            preferences={preferences}
            onDelete={handleDeletePreference}
            onFinalize={handleFinalize}
          />

          {selectedFacultyTopics && (
            <TopicCards
              topics={selectedFacultyTopics}
              handleAddPreference={handleAddPreference}
              currentPrefIndex={currentPrefIndex}
              bin={data.bin}
              mode="student"
              preferences={preferences}
            />
          )}

          {data.outgoingRequests.length > 0 && (
            <div className={classes["request-toggle-wrapper"]}>
              <button
                onClick={handleToggleRequests}
                className={classes["request-toggle-btn"]}
              >
                {showRequests
                  ? "Hide Outgoing Requests"
                  : "View Outgoing Requests"}
              </button>
            </div>
          )}

          {showRequests && <RequestList requests={data.outgoingRequests} />}
        </>
      )}
      <FSTeamthere teamData={data.team} studentIcon={studentIcon} />
      {/* <TFTeamthereBin1 teamData={data.team} studentIcon={studentIcon} /> */}
    </>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const topicDataJSON = formData.get("topicData");
  const topicData = JSON.parse(topicDataJSON);
  const token = localStorage.getItem("token");

  const reqdata = {
    docId: topicData.docId,
    teamId: topicData.teamId,
    topicId: topicData.topicId,
  };

  const response = await fetch(
    "http://localhost:3000/student/btp/requestfaculty",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqdata),
    }
  );

  if (!response.ok) {
    const result = await response.json();
    console.log(result);
    throw new Response(
      JSON.stringify({
        message: "Error sending team request",
      }),
      {
        status: 500,
      }
    );
  }

  const result = await response.json();
  console.log(result);

  return redirect("/academics/btp/student");
}
