import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { ethers } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { PerpetualAddresses } from "../constants/PerpetualAddresses";
import PerpetualAbi from "../abis/Perpetual.json";
import Connection from "./Connection";

export interface Perp {
  name: string;
  symbol: string;
  address: string;
}

function usePerpAddresses() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);

  const { signer, network } = Connection.useContainer();
  const [perps, setPerps] = useState<Perp[]>([]);
  const [loading, setLoading] = useState(false);

  const getPerps = async () => {
    if (signer && network) {
      setLoading(true);
      // For each Perp address, find its token name and address
      const promises = PerpetualAddresses[network.chainId].map(
        async (perpAddress: string) => {
          const perp = new ethers.Contract(perpAddress, PerpetualAbi, signer);
          const tokenAddr = await perp.tokenCurrency();
          const token = new ethers.Contract(tokenAddr, erc20.abi, signer);
          const tokenName = await token.name();
          const tokenSymbol = await token.symbol();
          return {
            name: tokenName,
            symbol: tokenSymbol,
            address: perpAddress,
          };
        }
      );

      // set state w/ data
      const perps = await Promise.all(promises);
      setLoading(false);
      setPerps(perps);
    }
  };

  useEffect(() => {
    getPerps();
  }, [signer, network]);

  // set Perp address from query string (if it exists and is not the same)
  useEffect(() => {
    const queryAddress = router.query.address;
    const isNewAddress = queryAddress !== address;

    if (queryAddress && isNewAddress && typeof queryAddress === "string") {
      setPerpAddress(queryAddress);
    }
  }, [router]);

  // set Perp address and also push to query string in URL (if valid)
  const setPerpAddress = (value: string | null) => {
    setAddress(value);
    const noValidAddress = value === null || value.trim() === "";
    router.push({
      pathname: "/",
      query: noValidAddress ? {} : { address: value },
    });
  };

  return {
    perpAddress: address ? ethers.utils.getAddress(address) : null,
    setPerpAddress: setPerpAddress,
    isValid: ethers.utils.isAddress(address || ""),
    perps,
    loading,
  };
}

const PerpAddresses = createContainer(usePerpAddresses);

export default PerpAddresses;
