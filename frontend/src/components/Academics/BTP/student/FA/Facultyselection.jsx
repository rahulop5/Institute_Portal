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
  const [preferences, setPreferences] = useState(() => {
    if (data.team.preferences && data.team.preferences.length > 0) {
      console.log("hi");
      // Map backend prefs into frontend shape
      const filled = data.team.preferences
        .sort((a, b) => a.order - b.order)
        .map((p) => {
          const parentDoc = data.topics.find((t) => t._id === p.topicDoc);
          const topicObj = parentDoc?.topics.find((tp) => tp._id === p.topicId);
          return {
            title: topicObj?.topic || "Unknown Topic",
            description: topicObj?.about || "",
            facultyName: parentDoc?.faculty?.name || "Unknown",
            topicId: p.topicId,
            docId: p.topicDoc,
          };
        });

      // Fill empty slots up to 4
      while (filled.length < 4) filled.push(null);
      return filled;
    }
    return [null, null, null, null];
  });

  const [currentPrefIndex, setCurrentPrefIndex] = useState(0);
  const submit = useSubmit();

  const handleShowTopics = (facultyObj) => {
    setSelectedFaculty(facultyObj); // store faculty info
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

  const approvedRequest = data.outgoingRequests.find((r) => r.isapproved);

  const handleAddPreference = (topic) => {
    if (currentPrefIndex < 4) {
      const updated = [...preferences];
      updated[currentPrefIndex] = {
        title: topic.topic,
        description: topic.about,
        facultyName: selectedFaculty?.name,
        topicId: topic._id,
        topicDoc: topic.docId,
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

  const handleFinalize = () => {
    const teamId = data.team._id;
    const cleanedPrefs = preferences
      .filter((p) => p !== null)
      .map((p, idx) => ({
        topicDoc: p.topicDoc,
        topicId: p.topicId,
        order: idx + 1,
      }));

    console.log(cleanedPrefs);

    const formData = new FormData();
    formData.append(
      "prefsData",
      JSON.stringify({ teamId, preferences: cleanedPrefs })
    );

    submit(formData, {
      method: "post",
      action: "setpreferences",
    });
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

          {data.outgoingRequests.length === 0 && (
            <PreferenceOrder
              preferences={preferences}
              onDelete={handleDeletePreference}
              onFinalize={handleFinalize}
            />
          )}

          {selectedFacultyTopics && (
            <TopicCards
              topics={selectedFacultyTopics}
              handleAddPreference={(topic) =>
                handleAddPreference({ ...topic, docId: selectedFaculty._id })
              }
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

export async function setPreferencesAction({ request }) {
  const formData = await request.formData();
  const prefsDataJSON = formData.get("prefsData");
  const prefsData = JSON.parse(prefsDataJSON);
  const token = localStorage.getItem("token");

  const response = await fetch(
    "http://localhost:3000/student/btp/setpreferences",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(prefsData),
    }
  );

  if (!response.ok) {
    const result = await response.json();
    console.log(result);
    const err = await response.json();
    throw new Response(
      JSON.stringify({ message: err.message || "Error setting preferences" }),
      { status: 500 }
    );
  }

  const result = await response.json();
  console.log("Preferences saved:", result);

  return redirect("/academics/btp/student");
}
