import Chart from '@/components/Chart';
import {createApolloClient} from "@/core/api/client";
import {AllocationAndSpxReturnsQuery} from "@/core/api/gql/stock-to-asset-allocation.generated";
import {QUERY_ALLOCATION_AND_Spx_RETURNS} from "@/core/api/gql/stock-to-asset-allocation";
import BigNumber from "bignumber.js";

export default async function Home() {
    const client = createApolloClient();
    const {  error, loading, data} = await client.query<AllocationAndSpxReturnsQuery>({ query: QUERY_ALLOCATION_AND_Spx_RETURNS })

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error : {error.message}</p>;

    const correlationSquared = new BigNumber(data.queryAllocationAndSpxReturns.correlationSquared ?? 0).abs().toNumber().toFixed(5);
    const expectedReturns = new BigNumber(data.queryAllocationAndSpxReturns.expectedReturns ?? 0).toNumber();
    const lastUpdatedDate = new Date(data.queryAllocationAndSpxReturns.lastUpdatedDate).toLocaleDateString();
    const extrapolatedReturns = new BigNumber(data.queryAllocationAndSpxReturns.extrapolatedReturns ?? 0).multipliedBy(100).toFixed();
    const lastExtrapolatedDate = new Date(data.queryAllocationAndSpxReturns.lastExtrapolatedDate).toLocaleDateString();

    const allocationAxisTitle = "Stock Allocation (%)";
    const allocationPercentageMax = 57.5;
    const allocationPercentageMin = 17.5;
    const chartTitle = "Stock Asset Allocation vs S&P 500 Returns";
    const returnsAxisTitle = "S&P 500 10-Year Returns (%)";

    const chartData = getChartData(data)
    return (
        <div>
            <div className="pt-10">
                <Chart chartData={chartData} allocationAxisTitle={allocationAxisTitle} allocationPercentageMax={allocationPercentageMax} allocationPercentageMin={allocationPercentageMin} chartTitle={chartTitle} returnsAxisTitle={returnsAxisTitle}/>
            </div>
            <div className="mt-10 flex items-center justify-center gap-2">
                <div id="correlation-squared" className="border w-fit p-2 border-black">R<sup>2</sup>: {correlationSquared}</div>
                <div id="expected-returns" className="border w-fit p-2 border-black">Expected Returns: {expectedReturns}</div>
                <div id="last-updated-date" className="border w-fit p-2 border-black">Last Updated Date: {lastUpdatedDate}</div>
                <div id="extrapolated-returns" className="border w-fit p-2 border-black">Extrapolated Returns: {extrapolatedReturns}</div>
                <div id="last-extrapolated-date" className="border w-fit p-2 border-black">Last Extrapolated Date: {lastExtrapolatedDate}</div>
            </div>
        </div>
) ;
}

function getChartData(data: AllocationAndSpxReturnsQuery) {
    return data?.queryAllocationAndSpxReturns.data.map(item => {
        const date = new Date(item.date);
        const return10 = new BigNumber(item.return10 ?? 0).toNumber();
        const percentage = new BigNumber(item.percentage ?? 0).toNumber();

        return {
            date: date.toDateString(),
            return_10: return10,
            percentage
        }
    }) ?? [];
}
