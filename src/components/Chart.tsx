"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  type ChartOptions,
} from "chart.js";
import "chartjs-adapter-date-fns";
import annotationPlugin from "chartjs-plugin-annotation";
import type { AllocationPoint, Recession } from "@/core/api/types";
import { allocationChartData } from "@/utils/chart";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin,
);

export default function AllocationChart({
  chartData,
  recessionData,
}: {
  chartData: AllocationPoint[];
  recessionData: Recession[];
}) {
  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Stock Asset Allocation vs S&P 500 Returns",
      },
      legend: { position: "top" },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: (items) => {
            const timestamp = items[0]?.parsed.x;
            return timestamp == null
              ? ""
              : new Date(timestamp).toISOString().slice(0, 10);
          },
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y?.toFixed(2) ?? "Unavailable"}%`,
        },
      },
      annotation: {
        annotations: recessionData.map((recession) => ({
          type: "box",
          xMin: new Date(recession.start_date).getTime(),
          xMax: new Date(recession.end_date).getTime(),
          backgroundColor: "rgba(128, 128, 128, 0.2)",
          borderWidth: 0,
          drawTime: "beforeDatasetsDraw",
          adjustScaleRange: false,
        })),
      },
    },
    scales: {
      x: {
        type: "time",
        grid: { display: false },
        title: { display: true, text: "Date (UTC)" },
        ticks: {
          callback: (value) => new Date(Number(value)).getUTCFullYear(),
        },
      },
      allocation: {
        position: "left",
        grid: { display: false },
        title: { display: true, text: "Stock Allocation (%)" },
        ticks: { callback: (value) => `${value}%` },
        min: 17.5,
        max: 57.5,
      },
      returns: {
        position: "right",
        grid: { display: false },
        title: { display: true, text: "S&P 500 10-Year Returns (%)" },
        ticks: { callback: (value) => `${value}%` },
        max: 24,
        min: -7.5,
        reverse: true,
      },
    },
  };

  return (
    <div className="relative h-[60vh] w-full">
      <Line
        data={allocationChartData(chartData)}
        options={options}
        role="img"
        aria-label="Stock allocation and S&P 500 annualized ten-year returns, with recessions shaded grey"
      />
    </div>
  );
}
