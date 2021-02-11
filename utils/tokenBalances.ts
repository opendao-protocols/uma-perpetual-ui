import { BigNumber } from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const decimalsToToken = (
  amount: string | number | BigNumber,
  decimals: string | number | BigNumber
) => {
  const amt = new BigNumber(amount);
  const dec = new BigNumber(decimals);
  const ten = new BigNumber(10);

  const result = amt.div(ten.pow(dec));
  return result.toFixed();
};

export const tokenToDecimals = (
  amount: string | number | BigNumber,
  decimals: string | number | BigNumber
) => {
  const amt = new BigNumber(amount);
  const dec = new BigNumber(decimals);
  const ten = new BigNumber(10);

  const result = amt.times(ten.pow(dec));
  return result.toFixed(0, 1);
};
