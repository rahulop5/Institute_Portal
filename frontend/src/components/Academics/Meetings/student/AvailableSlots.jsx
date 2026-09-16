import { useEffect, useState } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { toast } from "react-toastify";
import styles from "./styles/AvailableSlots.module.css";
import { API_HOST } from "../../../../config";

export default function AvailableSlots() {
  const data = useLoaderData();
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [openSlotId, setOpenSlotId] = useState(null);
  const [purpose, setPurpose] = useState("");

  const faculty = data?.faculty;
  const slots = data?.slots || [];

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    } else if (fetcher.data?.success) {
      toast.success("Request sent! Check My Meetings for its status.");
    }
  }, [fetcher.data]);

  const handleRequest = (slotId) => {
    if (!purpose.trim()) {
      toast.error("Please add a short purpose for the meeting");
      return;
    }
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ slotId, purpose }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/student/requestslot",
      encType: "application/x-www-form-urlencoded",
    });
    setOpenSlotId(null);
    setPurpose("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{faculty?.name}'s available slots</h2>
      {slots.length === 0 ? (
        <p className={styles.empty}>No available slots right now.</p>
      ) : (
        slots.map((slot) => (
          <div key={slot._id} className={styles.card}>
            <div className={styles.meta}>
              {new Date(slot.date).toLocaleDateString()} · {slot.startTime}-{slot.endTime} · {slot.location}
            </div>
            {openSlotId === slot._id ? (
              <div className={styles.requestForm}>
                <textarea
                  placeholder="Reason for the meeting"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <div className={styles.requestActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setOpenSlotId(null);
                      setPurpose("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmBtn}
                    disabled={isSubmitting}
                    onClick={() => handleRequest(slot._id)}
                  >
                    {isSubmitting ? "Requesting..." : "Confirm request"}
                  </button>
                </div>
              </div>
            ) : (
              <button className={styles.requestBtn} onClick={() => setOpenSlotId(slot._id)}>
                Request
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export async function loader({ params }) {
  const token = localStorage.getItem("token");
  const response = await fetch(API_HOST + "/student/meetings/slots/" + params.facultyId, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!response.ok) {
    throw new Response(JSON.stringify({ message: "Error loading available slots" }), { status: 500 });
  }
  return await response.json();
}

export async function requestSlotAction({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/student/meetings/request", {
    method: "post",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error requesting slot" };
  }

  return { success: true };
}
