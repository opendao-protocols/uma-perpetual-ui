import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { BigNumber } from "bignumber.js";

import { toBn } from "../utils/BN";
import { decimalsToToken } from "../utils/tokenBalances";
import Connection from "./Connection";
import PerpContract from "./PerpContract";
import PerpState from "./PerpState";
import Collateral from "./Collateral";
import Token from "./Token";

export interface LiquidationState {
  liquidator: string;
  liquidatedCollateral: string;
  lockedCollateral: string;
  liquidationTime: number;
  liquidationTimeRemaining: number;
  liquidationId: number;
  tokensOutstanding: string;
  state: number;
}

function usePosition() {
  const { block$, signer, userAddress } = Connection.useContainer();
  const { contract } = PerpContract.useContainer();
  const { decimals: collDec } = Collateral.useContainer();
  const { decimals: tokenDec } = Token.useContainer();
  const { perpState } = PerpState.useContainer();
  const { liquidationLiveness } = perpState;

  const [collateral, setCollateral] = useState<string | null>(null);
  const [backingCollateral, setBackingCollateral] = useState<string | null>(
    null
  );
  const [tokens, setTokens] = useState<string | null>(null);
  const [cRatio, setCRatio] = useState<number | null>(null);
  const [withdrawAmt, setWithdrawAmt] = useState<string | null>(null);
  const [withdrawPassTime, setWithdrawPassTime] = useState<number | null>(null);
  const [pendingWithdraw, setPendingWithdraw] = useState<string | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<string | null>(null);
  const [liquidations, setLiquidations] = useState<LiquidationState[] | null>(
    null
  );

  const getPositionInfo = async () => {
    if (
      userAddress &&
      signer &&
      contract &&
      collDec &&
      tokenDec &&
      liquidationLiveness
    ) {
      // Make contract calls in parallel
      const [collRawFixedPoint, position, liquidations] = await Promise.all([
        contract.getCollateral(userAddress),
        contract.positions(userAddress),
        contract.getLiquidations(userAddress),
      ]);
      const collRaw: BigNumber = toBn(collRawFixedPoint[0]);

      // Reformat data
      const tokensOutstanding: BigNumber = toBn(position.tokensOutstanding[0]);
      const withdrawReqAmt: BigNumber = toBn(
        position.withdrawalRequestAmount[0]
      );
      const withdrawReqPassTime: BigNumber = toBn(
        position.withdrawalRequestPassTimestamp
      );
      const xferTime: BigNumber = toBn(
        position.transferPositionRequestPassTimestamp
      );

      const collateral: string = decimalsToToken(collRaw, collDec);
      const backingCollateral: string = decimalsToToken(
        collRaw.minus(withdrawReqAmt),
        collDec
      );
      const tokens: string = decimalsToToken(tokensOutstanding, tokenDec);
      const cRatio =
        backingCollateral !== null && tokens !== null
          ? Number(tokens) > 0
            ? Number(backingCollateral) / Number(tokens)
            : 0
          : null;
      const withdrawAmt: string = decimalsToToken(withdrawReqAmt, collDec);
      const withdrawPassTime: number = withdrawReqPassTime.toNumber();
      const pendingWithdraw: string =
        withdrawReqPassTime.toString() !== "0" ? "Yes" : "No";
      const pendingTransfer: string =
        xferTime.toString() !== "0" ? "Yes" : "No";

      // Only store unexpired liquidations in state
      const updatedLiquidations: LiquidationState[] = [];
      liquidations.forEach((liq: any, id: number) => {
        const liquidationTimeRemaining =
          liq.liquidationTime.toNumber() +
          toBn(liquidationLiveness).toNumber() -
          Math.floor(Date.now() / 1000);
        if (liquidationTimeRemaining > 0) {
          updatedLiquidations.push({
            liquidationId: id,
            liquidationTime: liq.liquidationTime.toNumber(),
            liquidationTimeRemaining: liquidationTimeRemaining,
            liquidator: liq.liquidator,
            liquidatedCollateral: decimalsToToken(
              liq.liquidatedCollateral[0],
              collDec
            ),
            lockedCollateral: decimalsToToken(liq.lockedCollateral[0], collDec),
            tokensOutstanding: decimalsToToken(
              liq.tokensOutstanding[0],
              tokenDec
            ),
            state: liq.state,
          });
        }
      });

      // set states
      setCollateral(collateral);
      setBackingCollateral(backingCollateral);
      setTokens(tokens);
      setCRatio(cRatio);
      setWithdrawAmt(withdrawAmt);
      setWithdrawPassTime(withdrawPassTime);
      setPendingWithdraw(pendingWithdraw);
      setPendingTransfer(pendingTransfer);
      setLiquidations(updatedLiquidations);
    }
  };

  // get position info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getPositionInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, userAddress, signer, contract, collDec, tokenDec]);

  // get position info on setting of vars
  useEffect(() => {
    if (contract === null) {
      setCollateral(null);
      setBackingCollateral(null);
      setTokens(null);
      setCRatio(null);
      setWithdrawAmt(null);
      setWithdrawPassTime(null);
      setPendingWithdraw(null);
      setPendingTransfer(null);
      setLiquidations(null);
    }
    getPositionInfo();
  }, [userAddress, signer, contract, collDec, tokenDec, liquidationLiveness]);

  return {
    collateral,
    backingCollateral,
    tokens,
    cRatio,
    withdrawAmt,
    withdrawPassTime,
    pendingWithdraw,
    pendingTransfer,
    liquidations,
  };
}

const Position = createContainer(usePosition);

export default Position;
