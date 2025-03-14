import Chart from "@/components/Chart";
import { AllocationAndSpxReturnsQuery } from "@/core/api/gql/stock-to-asset-allocation.generated";
import { QUERY_ALLOCATION_AND_Spx_RETURNS } from "@/core/api/gql/stock-to-asset-allocation";
import BigNumber from "bignumber.js";
import { formatBigNumber, formatDate } from "@/utils/format";
import { createApolloClient } from "@/core/api/client";
import {RECESSION_QUERY} from "@/core/api/gql/recession";
import {RecessionQuery} from "@/core/api/gql/recession.generated";
export const revalidate = 3600
export default async function Home() {
  const client = createApolloClient();
  const context = { next: { revalidate } };
  const { error, loading, data } =
    await client.query<AllocationAndSpxReturnsQuery>({
      query: QUERY_ALLOCATION_AND_Spx_RETURNS,
      context
    });

  const { data: recessionData } = await client.query<RecessionQuery>({
    query: RECESSION_QUERY,
    context
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
    allocationPercentageMax: 57.5,
    chartTitle: "Stock Asset Allocation vs S&P 500 Returns",
    returnsAxisTitle: "S&P 500 10-Year Returns (%)",
    recessionData: recessionData?.getRecessionData ?? []
  };

  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto">
        <Header title="Stock Asset Allocation vs SPX 10-Year Return" />
        <div>
          <p>
            This is a tool to help investors understand the correlation between
            stock asset allocation and S&P 500 returns. The tool uses a linear
            regression model to predict the correlation between the two variables.
            The model is trained on historical data and is updated regularly to
            reflect changes in the market.
          </p>          
          <p>
            If you want to support this project, so I can spin up a server and fetch data everyday,
            you can donate to this EVM address: <span className="font-bold">0x284653914156BF2729b04b5FfA68d722f13b034A</span>
          </p>
        </div>
      </div>
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
      
      <div className="mx-auto flex justify-center mt-2">
        If you want to contact me, please reach out at&nbsp;
        <a className="underline font-bold text-blue-500" href="mailto:me@rbus.me">me@rbus.me</a>
      </div>
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
