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
import type { AllocationPoint } from "@/core/api/types";
import { allocationChartData } from "@/utils/chart";

ChartJS.register(
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
}: {
  chartData: AllocationPoint[];
}) {
  const options: ChartOptions<"line"> = {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Stock Asset Allocation vs Annualized 10-Year SPX Return",
      },
      legend: {
        position: "top",
        align: "start",
        labels: { usePointStyle: true, pointStyle: "line" },
      },
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
            `${context.dataset.label}: ${context.parsed.y?.toFixed(3) ?? "Unavailable"}%`,
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: { unit: "year" },
        afterBuildTicks: (scale) => {
          const ticks = [];
          const firstYear = new Date(scale.min).getUTCFullYear();
          const lastYear = new Date(scale.max).getUTCFullYear();
          for (let year = firstYear; year <= lastYear; year++) {
            const value = Date.UTC(year, 0, 1);
            if (value >= scale.min && value <= scale.max) ticks.push({ value });
          }
          if (ticks.length > 0) scale.ticks = ticks;
        },
        grid: { display: false },
        title: { display: true, text: "Date (UTC)" },
        ticks: {
          callback: (value) => new Date(Number(value)).getUTCFullYear(),
        },
      },
      allocation: {
        position: "left",
        afterBuildTicks: (scale) => {
          scale.ticks = Array.from({ length: 8 }, (_, index) => ({
            value: 20 + index * 5,
          }));
        },
        grid: { color: "rgba(0, 0, 0, 0.12)" },
        title: { display: true, text: "Stock Allocation (%)" },
        ticks: {
          stepSize: 5,
          includeBounds: false,
          callback: (value) => `${value}%`,
        },
        min: 17.5,
        max: 57.5,
      },
      returns: {
        position: "right",
        grid: { display: false },
        title: { display: true, text: "S&P 500 10-Year Returns (%)" },
        ticks: {
          stepSize: 1,
          includeBounds: false,
          callback: (value) => `${value}%`,
        },
        min: -7.5,
        max: 24,
        reverse: true,
      },
    },
  };

  return (
    <div className="relative h-[70vh] min-h-[400px] w-full">
      <Line
        data={allocationChartData(chartData)}
        options={options}
        role="img"
        aria-label="Stock asset allocation and annualized ten-year S&P 500 returns"
      />
    </div>
  );
}
