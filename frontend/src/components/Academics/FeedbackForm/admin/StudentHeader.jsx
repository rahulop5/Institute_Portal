import React from "react";
import styles from "../styles/StudentHeader.module.css";
import download from "../../../../assets/studenticon.svg"

export default function StudentHeader() {
  const students = [
    {
      id: 11,
      name: "Sahal Ansar Theparambil",
      email: "sahalansar.t23@iiits.in",
      roll: "S20230010210",
      year: "UG2",
    },
    {
      id: 12,
      name: "Sahal Ansar Theparambil",
      email: "sahalansar.t23@iiits.in",
      roll: "S20230010210",
      year: "UG2",
    },
    {
      id: 13,
      name: "Sahal Ansar Theparambil",
      email: "sahalansar.t23@iiits.in",
      roll: "S20230010210",
      year: "UG2",
    },
    {
      id: 14,
      name: "Sahal Ansar Theparambil",
      email: "sahalansar.t23@iiits.in",
      roll: "S20230010210",
      year: "UG3",
    },
    {
      id: 15,
      name: "Sahal Ansar Theparambil",
      email: "sahalansar.t23@iiits.in",
      roll: "S20230010210",
      year: "UG3",
    },
  ];

  const exportCSV = () => {
    const csvHeader = "Name,Email,Roll No.,Year of Study\n";
    const csvRows = students
      .map(
        (s) => `${s.name},${s.email},${s.roll},${s.year}`
      )
      .join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "unregistered_students.csv";
    link.click();
  };

  return (
    <div className={styles.container}>
      <p className={styles.title}>Unregistered Students:</p>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Year of Study</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className={styles.index}>{s.id}</td>
                <td className={styles.nameCell}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      <img src={download} alt="avatar" />
                    </div>
                    <div>
                      <div className={styles.name}>{s.name}</div>
                      <div className={styles.email}>{s.email}</div>
                    </div>
                  </div>
                </td>
                <td>{s.roll}</td>
                <td>{s.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.exportRow}>
        <button className={styles.exportBtn} onClick={exportCSV}>
          Export as .csv
        </button>
      </div>
    </div>
  );
}
