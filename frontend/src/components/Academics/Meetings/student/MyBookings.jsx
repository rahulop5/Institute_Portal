import { useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { toast } from "react-toastify";
import styles from "./styles/MyBookings.module.css";
import { API_HOST } from "../../../../config";

const STATUS_LABEL = {
  requested: "Pending approval",
  booked: "Booked",
  cancelled: "Cancelled",
};

export default function MyBookings() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const meetings = data?.meetings || [];

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const handleWithdraw = (slotId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ slotId }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/student/withdrawrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>My meetings</h2>
      {meetings.length === 0 ? (
        <p className={styles.empty}>You haven't requested any meetings yet.</p>
      ) : (
        meetings.map((slot) => (
          <div key={slot._id} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.name}>{slot.faculty?.name}</div>
              <div className={styles.meta}>
                {new Date(slot.date).toLocaleDateString()} · {slot.startTime}-{slot.endTime} · {slot.location}
              </div>
              {slot.purpose && <div className={styles.purpose}>"{slot.purpose}"</div>}
            </div>
            <div className={styles.right}>
              <span className={styles[`status_${slot.status}`]}>{STATUS_LABEL[slot.status]}</span>
              {slot.status === "requested" && (
                <button className={styles.withdrawButton} onClick={() => handleWithdraw(slot._id)}>
                  Withdraw
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export async function loader() {
  const token = localStorage.getItem("token");
  const response = await fetch(API_HOST + "/student/meetings/mine", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Error loading your meetings" }), { status: 500 });
  }
  return await response.json();
}

export async function withdrawAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/student/meetings/withdraw", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error withdrawing request" };
  }

  return { success: true };
}
