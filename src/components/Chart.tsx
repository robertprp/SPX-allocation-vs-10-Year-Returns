"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
  TimeSeriesScale,
  TimeScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LogarithmicScale,
  TimeSeriesScale,
);

import React from "react";
import "chartjs-adapter-date-fns";

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
);

export default function AllocationChart({
  chartData,
  chartTitle,
  returnsAxisTitle,
  allocationAxisTitle,
  allocationPercentageMin,
  allocationPercentageMax,
}: {
  chartData: { date: string; return_10: number; percentage: number }[];
  chartTitle: string;
  returnsAxisTitle: string;
  allocationAxisTitle: string;
  allocationPercentageMin: number;
  allocationPercentageMax: number;
}) {
  const returnsData = chartData
    .filter((i) => i.return_10)
    .map((i) => ({
      x: new Date(i.date).getTime(),
      y: parseFloat((i.return_10 * 100).toFixed(2)),
    }));
  const allocationData = chartData.map((i) => ({
    x: new Date(i.date).getTime(),
    y:
      i.percentage !== 0
        ? parseFloat((i.percentage * 100).toFixed(2))
        : undefined,
  }));

  const data = {
    datasets: [
      {
        label: returnsAxisTitle,
        yAxisID: "returns",
        data: returnsData.map((i) => (i.x === 0 ? null : i)),
        borderColor: "rgb(0, 3, 109)",
        backgroundColor: "rgba(0, 3, 109, 0.1)",
        tension: 0.4, // Smooth the line
        pointRadius: 0, // Remove dots
      },
      {
        label: allocationAxisTitle,
        yAxisID: "allocation",
        data: allocationData,
        borderColor: "rgb(182, 0, 0)",
        backgroundColor: "rgba(182, 0, 0, 0.1)",
        tension: 0.4, // Smooth the line
        pointRadius: 0, // Remove dots
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: chartTitle,
      },
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.raw.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        title: {
          display: true,
          text: "Date",
        },
      },
      allocation: {
        position: "left",
        title: {
          display: true,
          text: allocationAxisTitle,
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
        min: allocationPercentageMin,
        max: allocationPercentageMax,
      },
      returns: {
        position: "right",
        title: {
          display: true,
          text: returnsAxisTitle,
        },
        ticks: {
          callback: (value) => `${value}%`,
        },
        max: 24,
        min: -7.5,
        reverse: true,
      },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "50vh", // Adjust as needed
        width: "100%",
      }}
    >
      <Line data={data} options={options} />
    </div>
  );
}
