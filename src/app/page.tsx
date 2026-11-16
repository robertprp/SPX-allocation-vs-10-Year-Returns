import Chart from "@/components/Chart";
import RefreshData from "@/components/RefreshData";
import { ApiError } from "@/core/api/client";
import { getAllocationAnalysis, loadAllRecessions } from "@/core/api/endpoints";
import type { AllocationAnalysis } from "@/core/api/types";
import { formatBigNumber, formatDate } from "@/utils/format";

// Load at request time so an unavailable API never becomes a cached build result.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [analysis, recessions] = await Promise.allSettled([
    getAllocationAnalysis(),
    loadAllRecessions(),
  ]);

  return (
    <main className="py-10 container-padding">
      <h1 className="mx-auto max-w-4xl text-3xl font-extrabold text-center">
        Stock Asset Allocation vs SPX 10-Year Return
      </h1>
      {analysis.status === "rejected" ? (
        <div role="status" className="py-10 text-center">
          <p>
            {analysis.reason instanceof ApiError &&
            analysis.reason.status === 503
              ? "Allocation analysis is temporarily unavailable. Data may still be loading or may be insufficient for analysis."
              : "Unable to load allocation analysis. Please try again."}
          </p>
          <RefreshData />
        </div>
      ) : (
        <>
          {analysis.value.data.length === 0 ? (
            <p role="status" className="py-10 text-center">
              No allocation observations are available yet.
            </p>
          ) : (
            <div className="pt-10">
              <Chart
                chartData={analysis.value.data}
                recessionData={
                  recessions.status === "fulfilled" ? recessions.value : []
                }
              />
            </div>
          )}
          {recessions.status === "rejected" && (
            <div role="status" className="text-center">
              <p>
                Recession periods are unavailable. Recession shading could not
                be loaded.
              </p>
              <RefreshData />
            </div>
          )}
          <Statistics analysis={analysis.value} />
        </>
      )}
      <div className="mx-auto mt-4 text-center">
        If you want to contact me, please reach out at{" "}
        <a
          className="underline font-bold text-blue-500"
          href="mailto:me@rbus.me"
        >
          me@rbus.me
        </a>
      </div>
    </main>
  );
}

function Statistics({ analysis }: { analysis: AllocationAnalysis }) {
  return (
    <div className="flex justify-center items-center flex-col">
      <div className="mt-10 mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2">
        <StatCard
          label="Squared Correlation"
          value={formatBigNumber(analysis.correlation_squared, 5)}
        />
        <StatCard
          label="Expected Annualized 10-Year SPX Return"
          value={`${formatBigNumber(analysis.expected_returns, 2, 100)}%`}
        />
        <StatCard
          label="Latest Allocation Publication Date"
          value={formatDate(analysis.last_updated_date)}
        />
        <StatCard
          label="Extrapolated Annualized 10-Year SPX Return"
          value={`${formatBigNumber(analysis.extrapolated_returns, 2, 100)}%*`}
          wide
        />
        <StatCard
          label="Last Extrapolated Date"
          value={formatDate(analysis.last_extrapolated_date)}
        />
      </div>
      <small className="mt-3">
        * Based on the latest S&P 500 total-return observation.
      </small>
    </div>
  );
}

function StatCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`border text-center p-2 border-black ${wide ? "sm:col-span-2" : ""}`}
    >
      <span>{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
