/* eslint-disable */
// @ts-ignore
import BigNumber from "bignumber.js";
import * as Types from "../schema";

export type AllocationDataFragmentFragment = {
  __typename?: "AllocationData";
  date: Date;
  percentage?: BigNumber | null;
  return10?: BigNumber | null;
};

export type StockToAssetAllocationFragmentFragment = {
  __typename?: "StockToAssetAllocation";
  correlationSquared?: BigNumber | null;
  expectedReturns?: BigNumber | null;
  extrapolatedReturns?: BigNumber | null;
  lastUpdatedDate: Date;
  lastExtrapolatedDate: Date;
  data: Array<{
    __typename?: "AllocationData";
    date: Date;
    percentage?: BigNumber | null;
    return10?: BigNumber | null;
  }>;
};

export type AllocationAndSpxReturnsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type AllocationAndSpxReturnsQuery = {
  __typename?: "Query";
  queryAllocationAndSpxReturns: {
    __typename?: "StockToAssetAllocation";
    correlationSquared?: BigNumber | null;
    expectedReturns?: BigNumber | null;
    extrapolatedReturns?: BigNumber | null;
    lastUpdatedDate: Date;
    lastExtrapolatedDate: Date;
    data: Array<{
      __typename?: "AllocationData";
      date: Date;
      percentage?: BigNumber | null;
      return10?: BigNumber | null;
    }>;
  };
};
