import { createContainer } from "unstated-next";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import PerpetualAbi from "../abis/Perpetual.json";
import Connection from "./Connection";
import PerpAddresses from "./PerpAddresses";

function useContract() {
  const { signer } = Connection.useContainer();
  const { perpAddress, isValid } = PerpAddresses.useContainer();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (perpAddress === null) {
      setContract(null);
    }
    if (perpAddress && isValid && signer) {
      const instance = new ethers.Contract(perpAddress, PerpetualAbi, signer);
      setContract(instance);
    }
  }, [perpAddress, isValid, signer]);

  return { contract };
}

const Contract = createContainer(useContract);

export default Contract;
