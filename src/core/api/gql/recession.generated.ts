/* eslint-disable */
// @ts-ignore
import BigNumber from "bignumber.js";
import * as Types from "../schema";

export type RecessionQueryVariables = Types.Exact<{ [key: string]: never }>;

export type RecessionQuery = {
  __typename?: "Query";
  getRecessionData: Array<{
    __typename?: "RecessionType";
    startDate: Date;
    endDate: Date;
  }>;
};
