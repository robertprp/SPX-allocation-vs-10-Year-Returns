import BigNumber from "bignumber.js";

type BigNumberish = BigNumber | string | number | null | undefined;

export function formatBigNumber(
  value: BigNumberish,
  decimals: number,
  multiplier = 1,
): string {
  return new BigNumber(value ?? 0).multipliedBy(multiplier).toFixed(decimals);
}

export function formatDate(date: Date | string | null | undefined): string {
  date = new Date(date ?? "");

  return `${date.getUTCDay()}/${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`
}
