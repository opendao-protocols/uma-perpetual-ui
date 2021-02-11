import { BigNumber } from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const toBn = (num: any) => {
  if (num) return new BigNumber(num.toString());
  return new BigNumber(num);
};

export const toBnFixed = (num: any) => {
  return toBn(num).toFixed();
};
