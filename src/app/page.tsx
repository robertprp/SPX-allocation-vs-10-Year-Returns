import Chart from "@/components/Chart";
import { createApolloClient } from "@/core/api/client";
import { AllocationAndSpxReturnsQuery } from "@/core/api/gql/stock-to-asset-allocation.generated";
import { QUERY_ALLOCATION_AND_Spx_RETURNS } from "@/core/api/gql/stock-to-asset-allocation";
import BigNumber from "bignumber.js";

export default async function Home() {
  const client = createApolloClient();
  const { error, loading, data } =
    await client.query<AllocationAndSpxReturnsQuery>({
      query: QUERY_ALLOCATION_AND_Spx_RETURNS,
    });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

    console.log({ data})
  const correlationSquared = new BigNumber(
    data.queryAllocationAndSpxReturns.correlationSquared ?? 0,
  )
    .abs()
    .toNumber()
    .toFixed(5);
  const expectedReturns = new BigNumber(
    data.queryAllocationAndSpxReturns.expectedReturns ?? 0,
  ).multipliedBy(100).toFixed(2);
  const lastUpdatedDate = new Date(
    data.queryAllocationAndSpxReturns.lastUpdatedDate,
  ).toLocaleDateString();
  const extrapolatedReturns = new BigNumber(
    data.queryAllocationAndSpxReturns.extrapolatedReturns ?? 0,
  )
    .multipliedBy(100)
    .toFixed();
  const lastExtrapolatedDate = new Date(
    data.queryAllocationAndSpxReturns.lastExtrapolatedDate,
  ).toLocaleDateString();

  const allocationAxisTitle = "Stock Allocation (%)";
    const allocationPercentageMin = 17.5;
  const allocationPercentageMax = 60;
  const chartTitle = "Stock Asset Allocation vs S&P 500 Returns";
  const returnsAxisTitle = "S&P 500 10-Year Returns (%)";

  const chartData = getChartData(data);

  console.log({ chartData })
  return (
    <div className="py-10">
        <div className="text-3xl font-extrabold text-center">
            Stock Asset Allocation vs SPX 10-Year Return
        </div>
      <div className="pt-10">
        <Chart
          chartData={chartData}
          allocationAxisTitle={allocationAxisTitle}
          allocationPercentageMax={allocationPercentageMax}
          allocationPercentageMin={allocationPercentageMin}
          chartTitle={chartTitle}
          returnsAxisTitle={returnsAxisTitle}
        />
      </div>

      <div className="flex justify-center items-center flex-col">
        <div className="mt-10 mx-auto grid grid-cols-3 gap-2 ">
          <div className="border text-center p-2 border-black">
            R<sup>2</sup>: <span className="font-bold">{correlationSquared}</span>
          </div>
          <div className="border text-center p-2 border-black">
            Expected 10-Year SPX Returns: <span className="font-bold">{expectedReturns}%</span>
          </div>
          <div className="border text-center p-2 border-black">
            Data last updated Date: {lastUpdatedDate}
          </div>
          <div className="border col-span-2 text-center p-2 border-black">
            Extrapolated 10-Year SPX Returns: {extrapolatedReturns}%*
          </div>
          <div className="border col-span-1 text-center p-2 border-black">
            Last Extrapolated Date: {lastExtrapolatedDate}
          </div>
        </div>
          <small className="mt-3">* Based on the current price of the SPX index</small>
      </div>
    </div>
  );
}

function getChartData(data: AllocationAndSpxReturnsQuery) {
  return (
    data?.queryAllocationAndSpxReturns.data.map((item) => {
      const date = new Date(item.date);
      const return10 = new BigNumber(item.return10 ?? 0).toNumber();
      const percentage = new BigNumber(item.percentage ?? 0).toNumber();

      return {
        date: date.toDateString(),
        return_10: return10,
        percentage,
      };
    }) ?? []
  );
}
