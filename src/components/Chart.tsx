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
  const latestAllocation = chartData.findLast(
    (point) => point.percentage != null,
  );
  const latestReturn = chartData.findLast((point) => point.return_10 != null);
  const hasPendingReturns =
    latestReturn != null &&
    chartData.some(
      (point) =>
        point.return_10 == null &&
        Date.parse(point.date) > Date.parse(latestReturn.date),
    );
  const coverageDate = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

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
        grid: { color: "rgba(0, 0, 0, 0.12)" },
        title: { display: true, text: "Stock Allocation (%)" },
        ticks: { callback: (value) => `${value}%` },
        grace: "5%",
      },
      returns: {
        position: "right",
        grid: { display: false },
        title: { display: true, text: "S&P 500 10-Year Returns (%)" },
        ticks: { callback: (value) => `${value}%` },
        grace: "5%",
        reverse: true,
      },
    },
  };

  return (
    <figure>
      <div className="relative h-[60vh] w-full">
        <Line
          data={allocationChartData(chartData)}
          options={options}
          role="img"
          aria-label="Stock allocation and S&P 500 annualized ten-year returns, with recessions shaded grey"
        />
      </div>
      <figcaption className="mt-3 text-center text-sm text-gray-700">
        <p>
          {latestAllocation
            ? `Allocation observations through ${coverageDate.format(new Date(latestAllocation.date))}. `
            : "No allocation observations are available. "}
          {latestReturn
            ? `Realized ten-year returns through ${coverageDate.format(new Date(latestReturn.date))}.`
            : "Realized ten-year returns are not yet available."}
        </p>
        {hasPendingReturns && (
          <p>
            More recent periods do not yet have ten years of future observations
            to calculate a realized return.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
