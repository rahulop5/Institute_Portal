import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "../styles/facultyStats.module.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChartBox({ responses, min, max }) {
  const data = {
    datasets: [
      {
        data: [responses.submitted, responses.yettosubmit],
        backgroundColor: ["#4e5dfc", "#ebe9ff"],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "80%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#333", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#4e5dfc",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 10,
        cornerRadius: 8,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div>
      <div className={styles.responseBoxContainer}>
        <h4>Responses</h4>
        <div className={styles.responseBox}>
          <div className={styles.doughnutContainer}>
            <Doughnut data={data} options={options} />
          </div>
          <div className={styles.responseStats}>
            <div className={styles.responseCountBoxsub}>
              <div>Submitted</div>
              <div className={styles.responseCount}>
                {responses.submitted}
              </div>
            </div>
            <div className={styles.responseCountBoxnot}>
              <div>Yet to Submit</div>
              <div className={styles.responseCount}>
                {responses.yettosubmit}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <span>Minimum</span>
          <h4>{min.score}</h4>
          <p>Question {min.question}</p>
        </div>
        <div className={styles.statCard}>
          <span>Maximum</span>
          <h4>{max.score}</h4>
          <p>Question {max.question}</p>
        </div>
      </div>
    </div>
  );
}
