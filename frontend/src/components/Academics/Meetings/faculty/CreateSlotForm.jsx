import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "react-toastify";
import styles from "./styles/CreateSlotForm.module.css";
import { API_HOST } from "../../../../config";

export default function CreateSlotForm() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    } else if (fetcher.data?.success) {
      toast.success("Slot added");
    }
  }, [fetcher.data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !location.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const formData = new FormData();
    formData.append("reqData", JSON.stringify({ date, startTime, endTime, location }));
    fetcher.submit(formData, {
      method: "post",
      action: "/academics/meetings/faculty/createslot",
      encType: "application/x-www-form-urlencoded",
    });
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
  };

  return (
    <form className={styles.container} onSubmit={handleSubmit}>
      <h2 className={styles.heading}>Add an available slot</h2>
      <div className={styles.row}>
        <label className={styles.field}>
          Date
          <input
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          Start time
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          End time
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          Location / link
          <input
            type="text"
            placeholder="Room 204 or a meeting link"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </label>
        <button className={styles.addButton} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add slot"}
        </button>
      </div>
    </form>
  );
}

export async function action({ request }) {
  const token = localStorage.getItem("token");
  const formData = await request.formData();
  const reqdata = formData.get("reqData");

  const response = await fetch(API_HOST + "/faculty/meetings/createslot", {
    method: "post",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: reqdata,
  });

  if (!response.ok) {
    const result = await response.json();
    return { error: result.message || "Error creating slot" };
  }

  return { success: true };
}
