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
import annotationPlugin from "chartjs-plugin-annotation";

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
    annotationPlugin
);

export default function AllocationChart({
  chartData,
  recessionData,
  chartTitle,
  returnsAxisTitle,
  allocationAxisTitle,
  allocationPercentageMin,
  allocationPercentageMax,
}: {
  chartData: { date: string; return_10: number; percentage: number }[];
  recessionData: { startDate: Date; endDate: Date }[];
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
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.y.toFixed(2)}%`,
        },
      },
    },
    annotation: {
      annotations: recessionData.map((recession) => ({
        type: "box",
        xMin: new Date(recession.startDate).getTime(),
        xMax: new Date(recession.endDate).getTime(),
        backgroundColor: "rgba(128, 128, 128, 0.2)", // Grey background
      })),
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
          callback: (value: any) => `${value}%`,
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
          callback: (value: any) => `${value}%`,
        },
        max: 24,
        min: -7.5,
        reverse: true,
      },
    },
  };

  // Add a plugin for rendering the recession rectangles
  const recessionPlugin = {
    id: "recessionBackground",
    beforeDraw: (chart: any) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.allocation;

      recessionData.forEach(({ startDate, endDate }) => {
        const startX = xAxis.getPixelForValue(new Date(startDate).getTime());
        const endX = xAxis.getPixelForValue(new Date(endDate).getTime());

        // Draw rectangle
        ctx.fillStyle = "rgba(128, 128, 128, 0.2)"; // Grey background
        ctx.fillRect(startX, yAxis.top, endX - startX, yAxis.bottom - yAxis.top);
      });
    },
  };

  // Register the plugin
  ChartJS.register(recessionPlugin);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "60vh", // Adjust as needed
        width: "100%",
      }}
    >
      <Line data={data as any} options={options as any} />
    </div>
  );
}
