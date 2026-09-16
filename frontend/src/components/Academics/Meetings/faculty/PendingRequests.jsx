import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "react-toastify";
import styles from "./styles/PendingRequests.module.css";
import { API_HOST } from "../../../../config";

export default function PendingRequests({ data }) {
  const fetcher = useFetcher();
  const pendingRequests = data?.pendingRequests || [];

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const handleApprove = (slotId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ slotId }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/faculty/approverequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleReject = (slotId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ slotId }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/faculty/rejectrequest",
      encType: "application/x-www-form-urlencoded",
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Pending requests</h2>
      {pendingRequests.length === 0 ? (
        <p className={styles.empty}>No pending requests.</p>
      ) : (
        pendingRequests.map((slot) => (
          <div key={slot._id} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.name}>{slot.requestedBy?.name || "Unknown student"}</div>
              <div className={styles.meta}>
                {new Date(slot.date).toLocaleDateString()} · {slot.startTime}-{slot.endTime} · {slot.location}
              </div>
              {slot.purpose && <div className={styles.purpose}>"{slot.purpose}"</div>}
            </div>
            <div className={styles.actions}>
              <button className={styles.reject} onClick={() => handleReject(slot._id)}>
                Reject
              </button>
              <button className={styles.approve} onClick={() => handleApprove(slot._id)}>
                Approve
              </button>
            </div>
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

  const response = await fetch(API_HOST + "/faculty/meetings/approve", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error approving request" };
  }

  return { success: true };
}

export async function action2({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/faculty/meetings/reject", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error rejecting request" };
  }

  return { success: true };
}
