import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import { toBnFixed } from "../utils/BN";
import Connection from "./Connection";
import PerpContract from "./PerpContract";

interface FundingRate {
  rate: string | null;
  identifier: string | null;
  cumulativeMultiplier: string | null;
  updateTime: string | null;
  applicationTime: string | null;
  proposalTime: string | null;

  // additional fields
  identifierStr: string | null;
}

interface ContractState {
  collateralCurrency: string | null;
  collateralRequirement: string | null;
  configStore: string | null;
  cumulativeFeeMultiplier: string | null;
  disputeBondPercentage: string | null;
  disputerDisputeRewardPercentage: string | null;
  finder: string | null;
  fundingRate: FundingRate | null;
  liquidationLiveness: string | null;
  minSponsorTokens: string | null;
  pfc: string | null;
  priceIdentifier: string | null;
  rawLiquidationCollateral: string | null;
  rawTotalPositionCollateral: string | null;
  sponsorDisputeRewardPercentage: string | null;
  timerAddress: string | null;
  tokenCurrency: string | null;
  totalPositionCollateral: string | null;
  totalTokensOutstanding: string | null;
  withdrawalLiveness: string | null;
  currentTime: string | null;

  // additional fields
  priceIdentifierStr: string | null;
}

const initState = {
  collateralCurrency: null,
  collateralRequirement: null,
  configStore: null,
  cumulativeFeeMultiplier: null,
  disputeBondPercentage: null,
  disputerDisputeRewardPercentage: null,
  finder: null,
  fundingRate: null,
  liquidationLiveness: null,
  minSponsorTokens: null,
  pfc: null,
  priceIdentifier: null,
  rawLiquidationCollateral: null,
  rawTotalPositionCollateral: null,
  sponsorDisputeRewardPercentage: null,
  timerAddress: null,
  tokenCurrency: null,
  totalPositionCollateral: null,
  totalTokensOutstanding: null,
  withdrawalLiveness: null,
  currentTime: null,

  // additional fields
  priceIdentifierStr: null,
};

const useContractState = () => {
  const { block$ } = Connection.useContainer();
  const { contract: perp } = PerpContract.useContainer();

  const [state, setState] = useState<ContractState>(initState);

  // get state from EMP
  const queryState = async () => {
    if (perp === null) {
      setState(initState);
    }
    if (perp) {
      // have to do this ugly thing because we want to call in parallel
      const res = await Promise.all([
        perp.collateralCurrency(),
        perp.collateralRequirement(),
        perp.configStore(),
        perp.cumulativeFeeMultiplier(),
        perp.disputeBondPercentage(),
        perp.disputerDisputeRewardPercentage(),
        perp.finder(),
        perp.fundingRate(),
        perp.liquidationLiveness(),
        perp.minSponsorTokens(),
        perp.pfc(),
        perp.priceIdentifier(),
        perp.rawLiquidationCollateral(),
        perp.rawTotalPositionCollateral(),
        perp.sponsorDisputeRewardPercentage(),
        perp.timerAddress(),
        perp.tokenCurrency(),
        perp.totalPositionCollateral(),
        perp.totalTokensOutstanding(),
        perp.withdrawalLiveness(),
        perp.getCurrentTime(),
      ]);

      const newState: ContractState = {
        collateralCurrency: res[0] as string, // address
        collateralRequirement: toBnFixed(res[1]) as string,
        configStore: res[2] as string,
        cumulativeFeeMultiplier: toBnFixed(res[3]) as string,
        disputeBondPercentage: toBnFixed(res[4]) as string,
        disputerDisputeRewardPercentage: toBnFixed(res[5]) as string,
        finder: res[6] as string,
        fundingRate: {
          rate: toBnFixed(res[7].rate),
          identifier: res[7].identifier,
          cumulativeMultiplier: toBnFixed(res[7].cumulativeMultiplier),
          updateTime: toBnFixed(res[7].updateTime),
          applicationTime: toBnFixed(res[7].applicationTime),
          proposalTime: toBnFixed(res[7].proposalTime),
          // additional fields
          identifierStr: ethers.utils.parseBytes32String(res[7].identifier),
        } as FundingRate,
        liquidationLiveness: toBnFixed(res[8]) as string,
        minSponsorTokens: toBnFixed(res[9]) as string,
        pfc: toBnFixed(res[10]) as string,
        priceIdentifier: res[11] as string,
        rawLiquidationCollateral: toBnFixed(res[12]) as string,
        rawTotalPositionCollateral: toBnFixed(res[13]) as string,
        sponsorDisputeRewardPercentage: toBnFixed(res[14]) as string,
        timerAddress: res[15] as string,
        tokenCurrency: res[16] as string,
        totalPositionCollateral: toBnFixed(res[17]) as string,
        totalTokensOutstanding: toBnFixed(res[18]) as string,
        withdrawalLiveness: toBnFixed(res[19]) as string,
        currentTime: toBnFixed(res[20]) as string,

        // additional fields
        priceIdentifierStr: ethers.utils.parseBytes32String(res[11]) as string,
      };

      setState(newState);
    }
  };

  // get state on setting of contract
  useEffect(() => {
    queryState();
  }, [perp]);

  // get state on each block
  useEffect(() => {
    if (block$ && perp) {
      const sub = block$.subscribe(() => queryState());
      return () => sub.unsubscribe();
    }
  }, [block$, perp]);

  return { perpState: state };
};

const PerpState = createContainer(useContractState);

export default PerpState;
