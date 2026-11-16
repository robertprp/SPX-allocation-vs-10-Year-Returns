import type { ChartData } from "chart.js";
import type { AllocationPoint } from "../core/api/types";

type ChartPoint = { x: number; y: number | null };

function chartPercentage(value: string | null | undefined): number | null {
  return value == null ? null : Number(value) * 100;
}

/** Keep API dates and nulls; convert fractions to percentages exactly once. */
export function allocationChartData(
  points: AllocationPoint[],
): ChartData<"line", ChartPoint[]> {
  return {
    datasets: [
      {
        label: points.some((point) => point.return_10 != null)
          ? "S&P 500 10-Year Returns (%)"
          : "S&P 500 10-Year Returns (%) — unavailable",
        yAxisID: "returns",
        data: points.map((point) => ({
          x: new Date(point.date).getTime(),
          y: chartPercentage(point.return_10),
        })),
        borderColor: "rgb(0, 3, 109)",
        backgroundColor: "rgba(0, 3, 109, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        spanGaps: false,
      },
      {
        label: "Stock Allocation (%)",
        yAxisID: "allocation",
        data: points.map((point) => ({
          x: new Date(point.date).getTime(),
          y: chartPercentage(point.percentage),
        })),
        borderColor: "rgb(182, 0, 0)",
        backgroundColor: "rgba(182, 0, 0, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        spanGaps: false,
      },
    ],
  };
}
