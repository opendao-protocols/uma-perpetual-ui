import { BigNumber } from "bignumber.js";
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_DOWN });

export const toBN = (num: any) => {
  return new BigNumber(num);
};
