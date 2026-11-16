import type { components } from "./types.generated";

// REST v1 types come from the checked-in API schema. Keep decimal strings intact
// until charting or formatting. Schema-nullable fields may also be omitted.
export type DateTime = string;
export type DecimalString = string;
export type Recession = components["schemas"]["RecessionModel"];
export type Sp500Daily = components["schemas"]["SP500DailyModel"];
export type Sp500Monthly = components["schemas"]["SP500MonthlyModel"];
export type StockAssetAllocation =
  components["schemas"]["StockAssetAllocationModel"];
export type AllocationPoint = components["schemas"]["AllocationPoint"];
export type AllocationAnalysis = components["schemas"]["AllocationAnalysis"];
export type DatasetStatus = components["schemas"]["DatasetStatus"];
export type ApiErrorBody = components["schemas"]["ErrorResponse"];
