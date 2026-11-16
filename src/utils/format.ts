import BigNumber from "bignumber.js";

type BigNumberish = BigNumber | string | number | null | undefined;

export function formatBigNumber(
  value: BigNumberish,
  decimals: number,
  multiplier = 1,
): string {
  if (value === null || value === undefined) return "Unavailable";
  return new BigNumber(value).multipliedBy(multiplier).toFixed(decimals);
}

export function formatDate(date: Date | string | null | undefined): string {
  date = new Date(date ?? "");

  if (Number.isNaN(date.getTime())) return "Unavailable";
  return `${date.getUTCDate()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`;
}
