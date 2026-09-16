import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "react-toastify";
import ConfirmationDialog from "./ConfirmationDialog";
import styles from "./styles/SlotsList.module.css";
import { API_HOST } from "../../../../config";

const STATUS_LABEL = {
  available: "Available",
  requested: "Requested",
  booked: "Booked",
  cancelled: "Cancelled",
};

export default function SlotsList({ data }) {
  const fetcher = useFetcher();
  const [confirmSlotId, setConfirmSlotId] = useState(null);
  const slots = data?.allSlots || [];

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const doCancel = (slotId) => {
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ slotId }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/faculty/cancelslot",
      encType: "application/x-www-form-urlencoded",
    });
  };

  const handleCancelClick = (slot) => {
    if (slot.status === "booked") {
      setConfirmSlotId(slot._id);
    } else {
      doCancel(slot._id);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Your slots</h2>
      {slots.length === 0 ? (
        <p className={styles.empty}>You haven't added any slots yet.</p>
      ) : (
        slots.map((slot) => (
          <div key={slot._id} className={styles.card}>
            <div className={styles.info}>
              <div className={styles.meta}>
                {new Date(slot.date).toLocaleDateString()} · {slot.startTime}-{slot.endTime} · {slot.location}
              </div>
              {slot.status === "booked" && slot.requestedBy && (
                <div className={styles.bookedWith}>with {slot.requestedBy.name}</div>
              )}
            </div>
            <div className={styles.right}>
              <span className={styles[`status_${slot.status}`]}>{STATUS_LABEL[slot.status]}</span>
              {(slot.status === "available" || slot.status === "booked") && (
                <button className={styles.cancelButton} onClick={() => handleCancelClick(slot)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}

      <ConfirmationDialog
        isOpen={confirmSlotId !== null}
        message="This slot is booked with a student. Cancelling it will notify them. Continue?"
        confirmLabel="Cancel meeting"
        cancelLabel="Keep it"
        onConfirm={() => {
          doCancel(confirmSlotId);
          setConfirmSlotId(null);
        }}
        onCancel={() => setConfirmSlotId(null)}
      />
    </div>
  );
}

export async function action({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/faculty/meetings/cancel", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error cancelling slot" };
  }

  return { success: true };
}
