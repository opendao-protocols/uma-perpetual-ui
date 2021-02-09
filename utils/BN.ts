import { BigNumber } from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const toBn = (num: any) => {
  return new BigNumber(num);
};

export const toBnFixed = (num: any) => {
  const numBN = new BigNumber(num.toString());
  return numBN.toFixed();
};