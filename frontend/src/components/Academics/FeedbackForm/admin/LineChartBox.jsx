import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import styles from "../styles/facultyStats.module.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

export default function LineChartBox({ questions }) {
  // Sort questions by order before displaying
  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  const data = {
    labels: sortedQuestions.map((q) => `Q${q.qno}`),
    datasets: [
      {
        label: "Average Score",
        data: sortedQuestions.map((q) => q.avgscore),
        borderColor: "#AFB3FF",
        backgroundColor: "rgba(27, 20, 20, 0.1)",
        tension: 0,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: { stepSize: 2 },
        grid: { color: "#b8b6b66f" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className={styles.chartBox}>
      <h4>Statistics</h4>
      <Line data={data} options={options} />
    </div>
  );
}
