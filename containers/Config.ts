// Onboard.js requires API keys for some providers. These keys provided below
// Enable the dapp to work out of the box without any custom configs.
// You can choose to specify these env variables if you wish to get analytics
// over user interactions. Otherwise, defaults are used.
import { ethers } from "ethers";
type Network = ethers.providers.Network;
export const config = (network: Network | null) => {
  const infuraId =
    process.env.NEXT_PUBLIC_INFURA_ID || "f6b63b36b9f44416b1077504108b192c";
  const infuraRpc = `https://${
    network ? network?.name : "mainnet"
  }.infura.io/v3/${infuraId}`;

  return {
    onboardConfig: {
      apiKey:
        process.env.NEXT_PUBLIC_ONBOARD_API_KEY ||
        "2b8f4310-f2de-455d-b608-dd49cab1ebc3",
      onboardWalletSelect: {
        wallets: [
          { walletName: "metamask", preferred: true },
          {
            walletName: "walletConnect",
            rpc: { [network?.chainId || 1]: infuraRpc },
            preferred: true,
          },
          {
            walletName: "imToken",
            rpcUrl:
              !!network && network.chainId === 1
                ? "https://mainnet-eth.token.im"
                : "https://eth-testnet.tokenlon.im",
            preferred: true,
          },
          { walletName: "coinbase", preferred: true },
          {
            walletName: "ledger",
            rpcUrl: infuraRpc,
            preferred: true,
          },
          {
            walletName: "portis",
            apiKey: process.env.NEXT_PUBLIC_PORTIS_API_KEY,
            preferred: true,
          },
          { walletName: "trust", rpcUrl: infuraRpc, preferred: true },
          { walletName: "dapper", preferred: true },
          { walletName: "walletLink", rpcUrl: infuraRpc, preferred: true },
          { walletName: "opera", preferred: true },
          { walletName: "operaTouch", preferred: true },
          { walletName: "torus", preferred: true },
          { walletName: "status", preferred: true },
          { walletName: "unilogin", preferred: true },
        ],
      },
      walletCheck: [
        { checkName: "connect" },
        { checkName: "accounts" },
        // { checkName: "network" },
        { checkName: "balance", minimumBalance: "0" },
      ],
    },
  };
};
