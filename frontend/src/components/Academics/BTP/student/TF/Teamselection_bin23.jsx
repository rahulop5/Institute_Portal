import { redirect, useSubmit } from "react-router";
import studentIcon from "../../../../../assets/studenticon.svg";
import TFBin23Requests from "./TFBin23Requests";
import TFBin23teamthere from "./TFBin23teamthere";
import classes from "../../../../styles/TeamSelectionbin1.module.css";

// Dummy incoming request data (replace with actual backend data later)
const incomingRequests = [
  {
    email: "yash.priya24@example.com",
    phase: "TF",
    bin: 2,
    message: "Partial Team but self approved",
    team: {
      _id: "686ea29b3c5f717e18b8e8b6",
      bin1: {
        email: "kunal.myra5@example.com",
        name: "Kunal Myra",
        rollno: "S20211005",
        section: "1",
        bin: 1,
        approved: true,
      },
      bin2: {
        email: "yash.priya24@example.com",
        name: "Yash Priya",
        rollno: "S20211024",
        section: "2",
        bin: 2,
        approved: false,
      },
      bin3: {
        email: "meera.ira43@example.com",
        name: "Meera Ira",
        rollno: "S20211043",
        section: "3",
        bin: 3,
        approved: false,
      },
    },
  },
  {
    email: "diya.sai38@example.com",
    phase: "TF",
    bin: 2,
    message: "Partial Team but self approved",
    team: {
      _id: "d1a1team",
      bin1: {
        email: "vivaan.sneha21@example.com",
        name: "Vivaan Sneha",
        rollno: "S20211021",
        section: "1",
        bin: 1,
        approved: true,
      },
      bin2: {
        email: "diya.sai38@example.com",
        name: "Diya Sai",
        rollno: "S20211038",
        section: "1",
        bin: 2,
        approved: false,
      },
      bin3: {
        email: "anika.ira49@example.com",
        name: "Anika Ira",
        rollno: "S20211049",
        section: "2",
        bin: 3,
        approved: false,
      },
    },
  },
];

const temp = {
  email: "kabir.neha28@example.com",
  inteam: 0,
  phase: "TF",
  bin: 2,
  message: "Partial teams but not self approved",
  teams: [
    {
      _id: "6875594aea96cf6e468cade7",
      bin1: {
        email: "neha.saanvi9@example.com",
        name: "Neha Saanvi",
        approved: true,
      },
      bin2: {
        email: "kabir.neha28@example.com",
        name: "Kabir Neha",
        approved: false,
      },
      bin3: {
        email: "neha.dev46@example.com",
        name: "Neha Dev",
        approved: false,
      },
    },
  ],
};

const temp2 = {
  email: "vivaan.sneha21@example.com",
  inteam: 1,
  phase: "TF",
  bin: 2,
  message: "Full team",
  team: {
    _id: "686ea21605c14e3f3d14957d",
    bin1: {
      email: "vihaan.isha1@example.com",
      name: "Vihaan Isha",
      approved: true,
    },
    bin2: {
      email: "vivaan.sneha21@example.com",
      name: "Vivaan Sneha",
      approved: true,
    },
    bin3: {
      email: "diya.sai38@example.com",
      name: "Diya Sai",
      approved: true,
    },
  },
};

export default function BTPTeamselection_bin23({ data }) {
  const submit = useSubmit();

  const handleAccept = (team) => {
    const formData = new FormData();
    formData.append("teamData", JSON.stringify(team));
    submit(formData, {
      method: "post",
      action: "acceptteamrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleReject = (team) => {
    const formData = new FormData();
    formData.append("teamData", JSON.stringify(team));
    submit(formData, {
      method: "post",
      action: "rejectteamrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className={classes["team-selection"]}>
      <div className={classes["team-selection-content"]}>
        {data.inteam === 0 ? (
          <>
            {data.teams.length > 0 ? (
              <div className={classes["team-selection-header"]}>
                {!data.inteam && (
                  <>
                    <h2>Incoming Requests</h2>
                    <div className={classes["warning-message"]}>
                      <p>
                        Only <strong>ONE</strong> team leader can be accepted
                        and it is final.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className={classes["warning-message"]}>
                  <p>No Incoming Requests</p>
                </div>
              </>
            )}
            <TFBin23Requests
              incomingRequests={data?.teams}
              studentIcon={studentIcon}
              handleAccept={handleAccept}
              handleReject={handleReject}
            />
          </>
        ) : (
          <TFBin23teamthere
            approvedTeam={data?.team}
            studentIcon={studentIcon}
          />
        )}
      </div>
    </div>
  );
}

export async function action({ request }) {
  const formData = await request.formData();
  const teamDataJSON = formData.get("teamData");
  const teamData = JSON.parse(teamDataJSON);
  const token = localStorage.getItem("token");
  const reqdata = {
    teamid: teamData._id,
  };

  const response = await fetch(
    "http://localhost:3000/student/btp/approverequest",
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
    throw new Response(
      JSON.stringify({
        message: "Error approving team request",
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

export async function action2({ request }) {
  const formData = await request.formData();
  const teamDataJSON = formData.get("teamData");
  const teamData = JSON.parse(teamDataJSON);
  const token = localStorage.getItem("token");
  const reqdata = {
    teamid: teamData._id,
  };

  const response = await fetch(
    "http://localhost:3000/student/btp/rejectrequest",
    {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqdata),
    }
  );

  if (!response.ok) {
    throw new Response(
      JSON.stringify({
        message: "Error rejecting team request",
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
