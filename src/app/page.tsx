import Chart from "@/components/Chart";
import RefreshData from "@/components/RefreshData";
import { ApiError } from "@/core/api/client";
import { getAllocationAnalysis } from "@/core/api/endpoints";
import type { AllocationPoint } from "@/core/api/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let chartData: AllocationPoint[] = [];
  let errorMessage: string | null = null;
  try {
    chartData = (await getAllocationAnalysis()).data;
  } catch (error) {
    errorMessage =
      error instanceof ApiError && error.status === 503
        ? "Chart data is temporarily unavailable. Please try again."
        : "Unable to load chart data. Please try again.";
  }

  return (
    <main className="py-10 container-padding">
      <h1 className="mx-auto max-w-4xl text-3xl font-extrabold text-center">
        Stock Asset Allocation vs SPX 10-Year Return
      </h1>
      {errorMessage ? (
        <div role="status" className="py-10 text-center">
          <p>{errorMessage}</p>
          <RefreshData />
        </div>
      ) : chartData.length === 0 ? (
        <p role="status" className="py-10 text-center">
          No chart observations are available yet.
        </p>
      ) : (
        <div className="pt-10">
          <Chart chartData={chartData} />
        </div>
      )}
    </main>
  );
}
