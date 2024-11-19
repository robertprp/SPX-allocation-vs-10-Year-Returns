"use client";
import Chart from "@/components/Chart";
import { AllocationAndSpxReturnsQuery } from "@/core/api/gql/stock-to-asset-allocation.generated";
import { QUERY_ALLOCATION_AND_Spx_RETURNS } from "@/core/api/gql/stock-to-asset-allocation";
import BigNumber from "bignumber.js";
import { formatBigNumber, formatDate } from "@/utils/format";
import { createApolloClient } from "@/core/api/client";
import {RECESSION_QUERY} from "@/core/api/gql/recession";
import {RecessionQuery} from "@/core/api/gql/recession.generated";

export default async function Home() {
  const client = createApolloClient();
  const { error, loading, data } =
    await client.query<AllocationAndSpxReturnsQuery>({
      query: QUERY_ALLOCATION_AND_Spx_RETURNS,
    });

  const { data: recessionData } = await client.query<RecessionQuery>({
    query: RECESSION_QUERY,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const {
    correlationSquared,
    expectedReturns,
    lastUpdatedDate,
    extrapolatedReturns,
    lastExtrapolatedDate,
    chartData,
  } = processQueryData(data);

  const chartConfig = {
    allocationAxisTitle: "Stock Allocation (%)",
    allocationPercentageMin: 17.5,
    allocationPercentageMax: 60,
    chartTitle: "Stock Asset Allocation vs S&P 500 Returns",
    returnsAxisTitle: "S&P 500 10-Year Returns (%)",
    recessionData: recessionData?.getRecessionData ?? []
  };

  return (
    <div className="py-10">
      <Header title="Stock Asset Allocation vs SPX 10-Year Return" />
      <div className="pt-10">
        <Chart {...chartConfig} chartData={chartData} />
      </div>
      <Statistics
        correlationSquared={correlationSquared}
        expectedReturns={expectedReturns}
        lastUpdatedDate={lastUpdatedDate}
        extrapolatedReturns={extrapolatedReturns}
        lastExtrapolatedDate={lastExtrapolatedDate}
      />
    </div>
  );
}

function Header({ title }: { title: string }) {
  return <div className="text-3xl font-extrabold text-center">{title}</div>;
}

function Statistics({
  correlationSquared,
  expectedReturns,
  lastUpdatedDate,
  extrapolatedReturns,
  lastExtrapolatedDate,
}: {
  correlationSquared: string;
  expectedReturns: string;
  lastUpdatedDate: string;
  extrapolatedReturns: string;
  lastExtrapolatedDate: string;
}) {
  return (
    <div className="flex justify-center items-center flex-col">
      <div className="mt-10 mx-auto grid grid-cols-3 gap-2">
        <StatCard label="R²" value={correlationSquared} />
        <StatCard
          label="Expected 10-Year SPX Returns"
          value={`${expectedReturns}%`}
        />
        <StatCard label="Data Last Updated Date" value={lastUpdatedDate} />
        <StatCard
          label="Extrapolated 10-Year SPX Returns"
          value={`${extrapolatedReturns}%*`}
          span={2}
        />
        <StatCard label="Last Extrapolated Date" value={lastExtrapolatedDate} />
      </div>
      <small className="mt-3">
        * Based on the current price of the SPX index
      </small>
    </div>
  );
}

function StatCard({
  label,
  value,
  span = 1,
}: {
  label: string;
  value: string;
  span?: number;
}) {
  return (
    <div
      className={`border text-center p-2 border-black ${span > 1 ? `col-span-${span}` : ""}`}
    >
      <span>{label}: </span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function processQueryData(data: AllocationAndSpxReturnsQuery) {
  const correlationSquared = formatBigNumber(
    data.queryAllocationAndSpxReturns.correlationSquared,
    5,
  );
  const expectedReturns = formatBigNumber(
    data.queryAllocationAndSpxReturns.expectedReturns,
    2,
    100,
  );
  const lastUpdatedDate = formatDate(
    data.queryAllocationAndSpxReturns.lastUpdatedDate,
  );
  const extrapolatedReturns = formatBigNumber(
    data.queryAllocationAndSpxReturns.extrapolatedReturns,
    2,
    100,
  );
  const lastExtrapolatedDate = formatDate(
    data.queryAllocationAndSpxReturns.lastExtrapolatedDate,
  );

  const chartData =
    data.queryAllocationAndSpxReturns.data?.map((item) => ({
      date: new Date(item.date).toDateString(),
      return_10: new BigNumber(item.return10 ?? 0).toNumber(),
      percentage: new BigNumber(item.percentage ?? 0).toNumber(),
    })) ?? [];

  return {
    correlationSquared,
    expectedReturns,
    lastUpdatedDate,
    extrapolatedReturns,
    lastExtrapolatedDate,
    chartData,
  };
}
