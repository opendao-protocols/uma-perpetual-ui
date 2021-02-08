import { ethers } from "ethers";

const toBeTaggedAddr = "0x9a9dcd6b52B45a78CD13b395723c245dAbFbAb71";

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
