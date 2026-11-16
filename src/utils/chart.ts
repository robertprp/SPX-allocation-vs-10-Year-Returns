import type { ChartData } from "chart.js";
import type { AllocationPoint } from "../core/api/types";

type ChartPoint = { x: number; y: number | null };

/** Convert fractions only at the chart boundary; nulls remain visible gaps. */
export function allocationChartData(
  points: AllocationPoint[],
): ChartData<"line", ChartPoint[]> {
  return {
    datasets: [
      {
        label: "S&P 500 10-Year Returns (%)",
        yAxisID: "returns",
        data: points.map((point) => ({
          x: new Date(point.date).getTime(),
          y: point.return_10 == null ? null : Number(point.return_10) * 100,
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
          y: point.percentage == null ? null : Number(point.percentage) * 100,
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
