import { ethers } from "ethers";
import { AddressConstants } from "../constants/AddressConstants";

const toBeTaggedAddr = AddressConstants.DevMiningTag;

export const tag = (
  contract: ethers.Contract,
  functionName: string,
  functionParams: any
) => {
  const data = createData(contract, functionName, functionParams);
  return tagData(data, toBeTaggedAddr);
};

function createData(
  contract: ethers.Contract,
  functionName: string,
  functionParams: any
) {
  return contract.interface.encodeFunctionData(functionName, functionParams);
}

// This takes encoded data field and just appends the tag
// The tag must be valid hex
function tagData(data: string, dataTag: string) {
  return ethers.utils.hexConcat([data, dataTag]);
}
