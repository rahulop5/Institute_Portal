import { useState } from "react";
import { redirect, useSubmit } from "react-router";
import FacultyList from "./FSlist";
import TopicCards from "./FStopiclist";
import RequestList from "./Requestlist";
import ApprovedCard from "./ApprovedCard";
import studentIcon from '../../../assets/studenticon.svg';
import FSTeamthere from "./FSTeamshow";

export default function FacultySelection({ data }) {
  const [selectedFacultyTopics, setSelectedFacultyTopics] = useState(null);
  const [showRequests, setShowRequests] = useState(true);
  const submit = useSubmit();

  const handleShowTopics = (facultyObj) => {
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

  return (
    <>
      {/* Faculty assigned */}
      {data.facultyassigned && approvedRequest ? (
        <ApprovedCard request={approvedRequest} />
      ) : (
        <>
          {/* Faculty not yet assigned */}
          <FacultyList topics={data.topics} onShowTopics={handleShowTopics} />
          {selectedFacultyTopics && (
            <TopicCards
              topics={selectedFacultyTopics}
              handleApply={handleApply}
            />
          )}

          {data.outgoingRequests.length > 0 && (
            <div className="request-toggle-wrapper">
              <button
                onClick={handleToggleRequests}
                className="request-toggle-btn"
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
  console.log(result)
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

  return redirect("/academics/btp");
}
