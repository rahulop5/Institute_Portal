import { useState } from "react";
import { redirect, useSubmit } from "react-router";
import SearchIcon from "../../../../../assets/search.svg";
import studentIcon from "../../../../../assets/studenticon.svg";
import TFBin1TeamSelection from "./TFBin1TeamSelection";
import TFTeamthereBin1 from "./TFTeamthereBin1";
import classes from "../../../../styles/TeamSelectionbin1.module.css";

export default function BTPTeamselection_bin1({ data }) {
  const [selectedBin, setSelectedBin] = useState(2);
  const [selectedStudents, setSelectedStudents] = useState({});
  const submit = useSubmit();

  function handlebinchange(e) {
    const buttons = document.querySelectorAll(
      `.${classes["team-selection-button-group"]} button`
    );
    buttons.forEach((button) => {
      button.classList.remove(classes["active"]);
    });
    e.target.classList.add(classes["active"]);

    if (e.target.textContent === "Bin 2") {
      setSelectedBin(2);
    } else if (e.target.textContent === "Bin 3") {
      setSelectedBin(3);
    }
  }

  function handleStudentSelect(student, bin) {
    //unselect select type shi
    setSelectedStudents((prev) => {
      if (prev[bin]?.email === student.email) {
        const updated = { ...prev };
        delete updated[bin];
        return updated;
      } else {
        return {
          ...prev,
          [bin]: student,
        };
      }
    });
  }

  function handleSendRequest() {
    const formData = new FormData();
    formData.append("teamData", JSON.stringify(selectedStudents));
    submit(formData, {
      method: "post",
      action: "sendteamrequest",
      encType: "application/x-www-form-urlencoded",
    });
  }

  return (
    <>
      <div className={classes["team-selection"]}>
        {data.inteam === 0 ? (
          <TFBin1TeamSelection
            selectedBin={selectedBin}
            handlebinchange={handlebinchange}
            SearchIcon={SearchIcon}
            handleStudentSelect={handleStudentSelect}
            selectedStudents={selectedStudents}
            handleSendRequest={handleSendRequest}
            studentIcon={studentIcon}
            data={data}
          />
        ) : (
          <TFTeamthereBin1 teamData={data} studentIcon={studentIcon} />
        )}
      </div>
    </>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const teamDataJSON = formData.get("teamData");
  const teamData = JSON.parse(teamDataJSON);
  const token = localStorage.getItem("token");

  const reqdata = {
    bin2email: teamData[2].email,
    bin3email: teamData[3].email,
  };

  const response = await fetch("http://localhost:3000/student/btp/createteam", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqdata),
  });

  if (!response.ok) {
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

  return redirect("/academics/btp");
}
