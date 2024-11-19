import BigNumber from "bignumber.js";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /**
   * Implement the DateTime<Utc> scalar
   *
   * The input/output is a string in RFC3339 format.
   */
  DateTime: { input: Date; output: Date };
  Decimal: { input: BigNumber; output: BigNumber };
};

export type AllocationData = {
  __typename?: "AllocationData";
  date: Scalars["DateTime"]["output"];
  percentage?: Maybe<Scalars["Decimal"]["output"]>;
  return10?: Maybe<Scalars["Decimal"]["output"]>;
};

export type Query = {
  __typename?: "Query";
  getRecessionData: Array<RecessionType>;
  queryAllocationAndSpxReturns: StockToAssetAllocation;
};

export type RecessionType = {
  __typename?: "RecessionType";
  endDate: Scalars["DateTime"]["output"];
  startDate: Scalars["DateTime"]["output"];
};

export type StockToAssetAllocation = {
  __typename?: "StockToAssetAllocation";
  correlationSquared?: Maybe<Scalars["Decimal"]["output"]>;
  data: Array<AllocationData>;
  expectedReturns?: Maybe<Scalars["Decimal"]["output"]>;
  extrapolatedReturns?: Maybe<Scalars["Decimal"]["output"]>;
  lastExtrapolatedDate: Scalars["DateTime"]["output"];
  lastUpdatedDate: Scalars["DateTime"]["output"];
};
