import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";

import { toBn } from "../utils/BN";
import { decimalsToToken } from "../utils/tokenBalances";
import PerpState from "./PerpState";
import Collateral from "./Collateral";
import Token from "./Token";

function useTotals() {
  const { perpState } = PerpState.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();

  const [totalCollateral, setTotalCollateral] = useState<number | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [gcr, setGCR] = useState<number | null>(null);

  const {
    cumulativeFeeMultiplier: multiplier,
    rawTotalPositionCollateral: rawColl,
    totalTokensOutstanding: totalTokensWei,
  } = perpState;

  // set GCR when state updates
  useEffect(() => {
    if (multiplier && rawColl && totalTokensWei && collDec && tokenDec) {
      // use multiplier to find real total collateral in EMP
      const totalColl: BigNumber = toBn(decimalsToToken(multiplier, 18)).times(
        toBn(decimalsToToken(rawColl, collDec))
      );
      const totalTokens: BigNumber = toBn(
        decimalsToToken(totalTokensWei, tokenDec)
      );
      const gcr: BigNumber = totalTokens.isGreaterThan(0)
        ? totalColl.div(totalTokens)
        : toBn(0);

      // set states
      setTotalCollateral(totalColl.toNumber());
      setTotalTokens(totalTokens.toNumber());
      setGCR(gcr.toNumber());
    }
  }, [perpState, collDec, tokenDec]);

  return { totalCollateral, totalTokens, gcr };
}

const Totals = createContainer(useTotals);

export default Totals;
