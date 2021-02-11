import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";
import { BigNumber } from "bignumber.js";

import { toBn, toBnFixed } from "../utils/BN";
import { decimalsToToken } from "../utils/tokenBalances";
import Connection from "./Connection";
import PerpAddresses from "./PerpAddresses";
import PerpState from "./PerpState";

function useToken() {
  const { signer, userAddress, block$ } = Connection.useContainer();
  const { perpAddress } = PerpAddresses.useContainer();
  const { perpState } = PerpState.useContainer();
  const tokenAddress = perpState.tokenCurrency;

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<string | "Infinity" | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const getTokenInfo = async () => {
    if (contract) {
      const symbol: string = await contract.symbol();
      const name: string = await contract.name();
      const decimals: string = toBnFixed(await contract.decimals());
      const balanceRaw: string = toBnFixed(
        await contract.balanceOf(userAddress)
      );
      const allowanceRaw: BigNumber = toBn(
        await contract.allowance(userAddress, perpAddress)
      );

      // calculate readable balance and allowance
      const balance = decimalsToToken(balanceRaw, decimals);
      const allowance = allowanceRaw.eq(toBn(ethers.constants.MaxUint256))
        ? "Infinity"
        : decimalsToToken(allowanceRaw, decimals);

      // set states
      setSymbol(symbol);
      setName(name);
      setDecimals(decimals);
      setBalance(balance);
      setAllowance(allowance);
    }
  };

  const setMaxAllowance = async () => {
    if (contract && perpAddress) {
      try {
        await contract.approve(perpAddress, ethers.constants.MaxUint256);
      } catch (error) {
        console.error(error);
      }
    }
  };

  // get token info when contract changes
  useEffect(() => {
    setSymbol(null);
    setName(null);
    setDecimals(null);
    setBalance(null);
    setAllowance(null);
    getTokenInfo();
  }, [contract]);

  // get token info on each new block
  useEffect(() => {
    if (block$) {
      const sub = block$.subscribe(() => getTokenInfo());
      return () => sub.unsubscribe();
    }
  }, [block$, tokenAddress, signer, contract]);

  // set contract when collateral address changes
  useEffect(() => {
    if (signer && tokenAddress) {
      const instance = new ethers.Contract(tokenAddress, erc20.abi, signer);
      setContract(instance);
    }
  }, [signer, tokenAddress]);

  return {
    address: tokenAddress,
    contract,
    name,
    symbol,
    decimals,
    balance,
    allowance,
    setMaxAllowance,
  };
}

const Token = createContainer(useToken);

export default Token;
