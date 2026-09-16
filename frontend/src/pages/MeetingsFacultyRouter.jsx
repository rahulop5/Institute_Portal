import { useLoaderData } from "react-router";
import CreateSlotForm from "../components/Academics/Meetings/faculty/CreateSlotForm";
import SlotsList from "../components/Academics/Meetings/faculty/SlotsList";
import PendingRequests from "../components/Academics/Meetings/faculty/PendingRequests";
import styles from "../components/Academics/Meetings/faculty/styles/MeetingsFaculty.module.css";
import { API_HOST } from "../config";

export default function MeetingsFacultyRouter() {
  const data = useLoaderData();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Meetings</h1>
      <PendingRequests data={data} />
      <CreateSlotForm />
      <SlotsList data={data} />
    </div>
  );
}

export async function loader() {
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  switch (role) {
    case "Faculty": {
      const response = await fetch(API_HOST + "/faculty/meetings", {
        headers: { Authorization: "Bearer " + token },
      });
      if (!response.ok) {
        throw new Response(
          JSON.stringify({ message: "Error loading Meetings dashboard" }),
          { status: 500 }
        );
      }
      return await response.json();
    }

    default:
      throw new Response(
        JSON.stringify({ message: "Error loading Meetings dashboard" }),
        { status: 500 }
      );
  }
}
