// import { utils } from "ethers";
import styled from "styled-components";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Tooltip,
  InputAdornment,
} from "@material-ui/core";

// import { toBn } from "../../utils/BN";
import { decimalsToToken, tokenToDecimals } from "../../utils/tokenBalances";
import PerpContract from "../../containers/PerpContract";
import { useState, useEffect } from "react";
import Collateral from "../../containers/Collateral";
import Token from "../../containers/Token";
import PerpState from "../../containers/PerpState";
import Totals from "../../containers/Totals";
import Position from "../../containers/Position";
import PriceFeed from "../../containers/PriceFeed";
import Etherscan from "../../containers/Etherscan";
import Connection from "../../containers/Connection";

// import { legacyEMPs } from "../../constants/legacyEmps";
// import { getLiquidationPrice } from "../../utils/getLiquidationPrice";
// import { isPricefeedInvertedFromTokenSymbol } from "../../utils/getOffchainPrice";
// import { DOCS_MAP } from "../../constants/docLinks";
// import { toWeiSafe } from "../../utils/convertToWeiSafely";
import { tag } from "../../utils/devMiningTag";

// import YieldCalculator from "../yield/YieldCalculator";
// import YieldFarmingCalculator from "../yield/FarmingCalculator";
// import FarmingCalculator from "../liquidity-mining/FarmingCalculator";

// import { getExchangeInfo } from "../../utils/getExchangeLinks";

// import Balancer from "../../containers/Balancer";
// import WethContract from "../../containers/WethContract";

// import Weth from "../weth/Weth";
// import RenBTC from "../renbtc/RenBTC";

const Important = styled(Typography)`
  color: red;
  background: black;
  display: inline-block;
`;

const Link = styled.a`
  color: white;
  font-size: 14px;
`;

const HeadingData = styled.div`
  color: white;
  font-size: 20px;
  font-style: italic;
`;

const MinLink = styled.div`
  text-decoration-line: underline;
`;

const OutlinedContainer = styled.div`
  padding: 1rem;
  border: 1px solid #434343;
`;

// const { parseBytes32String: hexToUtf8 } = utils;

const Create = () => {
  const { network, provider, userAddress } = Connection.useContainer();
  const { contract: perp } = PerpContract.useContainer();
  const { perpState } = PerpState.useContainer();
  const {
    symbol: collSymbol,
    decimals: collDec,
    allowance: collAllowance,
    setMaxAllowance,
    balance,
  } = Collateral.useContainer();
  const {
    symbol: tokenSymbol,
    decimals: tokenDec,
    address: tokenAddress,
    balance: tokenBalance,
  } = Token.useContainer();

  const { gcr } = Totals.useContainer();
  const {
    collateral: posCollateralString,
    tokens: posTokensString,
    pendingWithdraw,
  } = Position.useContainer();
  const { latestPrice } = PriceFeed.useContainer();
  const { getEtherscanUrl } = Etherscan.useContainer();

  const [collateral, setCollateral] = useState<string>("0");
  const [tokens, setTokens] = useState<string>("0");
  const [hash, setHash] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const collateralNum = Number(collateral) || 0;
  const tokensNum = Number(tokens) || 0;

  const {
    collateralRequirement: collReq,
    minSponsorTokens,
    priceIdentifier,
  } = perpState;
  // const liquidationPriceWarningThreshold = 0.1;

  // const { usdPrice } = Balancer.useContainer();
  // const { contract: weth } = WethContract.useContainer();
  // const { address: collAddress } = Collateral.useContainer();
  // const REN_BTC_ADDRESS = "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d";

  useEffect(() => {
    setCollateralToMax();
  }, [balance]);

  // Sets `collateral` to the min amount of collateral that can be added to `startingCollateral` to keep the CR <= GCR.
  const _setBackingCollateralToMin = (
    _gcr: number,
    _tokens: number,
    startingCollateral: number
  ) => {
    // Set amount of collateral to the minimum required by the GCR constraint. This
    // is intended to encourage users to maximize their capital efficiency.
    const minBackingCollateral = _gcr * _tokens - startingCollateral;
    if (minBackingCollateral < 0) {
      setCollateral("0");
    } else {
      // We want to round down the number for better UI display, but we don't actually want the collateral
      // amount to round down since we want the minimum amount of collateral to pass the GCR constraint. So,
      // we'll add a tiny amount of collateral to avoid accidentally rounding too low.
      setCollateral((minBackingCollateral + 0.00005).toFixed(6));
    }
  };

  const setBackingCollateralToMin = (
    _gcr: number,
    transactionTokens: number,
    resultantPositionTokens: number,
    positionTokens: number,
    positionCollateral: number
  ) => {
    // Current EMP's require position CR must be > GCR otherwise transaction CR > GCR, therefore
    // if the current CR < GCR, then the min amount of collateral to deposit is equal to transaction CR (and resultant
    // CR will still be < GCR). If the current CR > GCR, then the min amount of collateral to deposit would set the
    // resultant CR to the GCR
    const currentCR =
      positionTokens > 0 ? positionCollateral / positionTokens : 0;
    if (currentCR < _gcr) {
      _setBackingCollateralToMin(_gcr, transactionTokens, 0);
    } else {
      _setBackingCollateralToMin(
        _gcr,
        resultantPositionTokens,
        positionCollateral
      );
    }
  };

  // Sets `tokens` to the max amount of tokens that can be added to `startingTokens` to keep the CR <= GCR.
  const _setTokensToMax = (
    _gcr: number,
    collateral: number,
    startingTokens: number
  ) => {
    // Set amount of tokens to the maximum required by the GCR constraint. This
    // is intended to encourage users to maximize their capital efficiency.
    const maxTokensToCreate = _gcr > 0 ? collateral / _gcr - startingTokens : 0;
    // Unlike the min collateral, we're ok if we round down the tokens slightly as round down
    // can only increase the position's CR and maintain it above the GCR constraint.
    setTokens((maxTokensToCreate - 0.0001).toFixed(4));
  };

  const setCollateralToMax = () => {
    if (balance !== null) {
      setCollateral(balance.toString());
    }
  };

  const setTokensToMax = (
    _gcr: number,
    transactionCollateral: number,
    resultantPositionCollateral: number,
    positionTokens: number,
    positionCollateral: number
  ) => {
    // Current EMP's require position CR must be > GCR otherwise transaction CR > GCR, therefore
    // if the current CR < GCR, then the max amount of tokens to mint is equal to transaction CR (and resultant
    // CR will still be < GCR). If the current CR > GCR, then the max amount of tokens to mint would set the
    // resultant CR to the GCR
    const currentCR =
      positionTokens > 0 ? positionCollateral / positionTokens : 0;
    if (currentCR < _gcr) {
      _setTokensToMax(_gcr, transactionCollateral, 0);
    } else {
      _setTokensToMax(_gcr, resultantPositionCollateral, positionTokens);
    }
  };

  // const exchangeInfo = getExchangeInfo(tokenSymbol);

  if (
    network !== null &&
    provider !== null &&
    userAddress !== null &&
    collReq !== null &&
    collDec !== null &&
    balance !== null &&
    collAllowance !== null &&
    perp !== null &&
    posTokensString !== null &&
    posCollateralString !== null &&
    minSponsorTokens !== null &&
    tokenDec !== null &&
    tokenAddress !== null &&
    // exchangeInfo !== undefined &&
    latestPrice !== null &&
    gcr !== null &&
    pendingWithdraw !== null &&
    tokenSymbol !== null &&
    collSymbol !== null &&
    priceIdentifier !== null &&
    // usdPrice !== null &&
    tokenBalance !== null
  ) {
    const collReqFromWei = parseFloat(decimalsToToken(collReq, 18));
    const collateralToDeposit = Number(collateral) || 0;
    const tokensToCreate = Number(tokens) || 0;
    const minSponsorTokensFromWei = parseFloat(
      decimalsToToken(minSponsorTokens, tokenDec)
    );
    const hasPendingWithdraw = pendingWithdraw === "Yes";
    // const priceIdentifierUtf8 = hexToUtf8(priceIdentifier);
    // const prettyLatestPrice = Number(latestPrice).toFixed(4);
    const posTokens = Number(posTokensString);
    const posCollateral = Number(posCollateralString);

    // const getExchangeLinkToken = exchangeInfo.getExchangeUrl(tokenAddress);

    // CR of new tokens to create. This must be > GCR according to https://github.com/UMAprotocol/protocol/blob/837869b97edef108fdf68038f54f540ca95cfb44/core/contracts/financial-templates/expiring-multiparty/PricelessPositionManager.sol#L409
    // const transactionCR = tokensToCreate > 0 ? collateralToDeposit / tokensToCreate : 0;
    // const pricedTransactionCR =
    //   latestPrice !== 0 ? (transactionCR / latestPrice).toFixed(4) : "0";
    // Resultant CR of position if new tokens were created by depositing chosen amount of collateral.
    // This is a useful data point for the user but has no effect on the contract's create transaction.
    const resultantCollateral = posCollateral + collateralToDeposit;
    const resultantTokens = posTokens + tokensToCreate;
    const resultantCR =
      resultantTokens > 0 ? resultantCollateral / resultantTokens : 0;
    const pricedResultantCR =
      latestPrice !== 0 ? (resultantCR / latestPrice).toFixed(4) : "0";
    // const resultantLiquidationPrice = getLiquidationPrice(
    //   resultantCollateral,
    //   resultantTokens,
    //   collReqFromWei,
    //   isPricefeedInvertedFromTokenSymbol(tokenSymbol)
    // ).toFixed(4);
    // const liquidationPriceDangerouslyFarBelowCurrentPrice = parseFloat(resultantLiquidationPrice) < (1 - liquidationPriceWarningThreshold) * latestPrice;
    // GCR: total contract collateral / total contract tokens.
    // const pricedGCR = latestPrice !== 0 ? (gcr / latestPrice).toFixed(4) : null;

    // Error conditions for calling create:
    const balanceBelowCollateralToDeposit = Number(balance) < collateralToDeposit;
    const needAllowance =
      collAllowance !== "Infinity" && Number(collAllowance) < collateralToDeposit;
    const resultantTokensBelowMin =
      resultantTokens < minSponsorTokensFromWei && resultantTokens !== 0;
    const resultantCRBelowRequirement =
      parseFloat(pricedResultantCR) >= 0 &&
      parseFloat(pricedResultantCR) < collReqFromWei;
    // const transactionCRBelowGCR = transactionCR < gcr;
    // const resultantCRBelowGCR = resultantCR < gcr;
    // const isLegacyEmp = legacyEMPs[network.chainId].includes(perp.address);
    // const cannotMint = isLegacyEmp
    //   ? transactionCRBelowGCR
    //   : transactionCRBelowGCR && resultantCRBelowGCR;


    const mintTokens = async () => {
      if (collateralToDeposit >= 0 && tokensToCreate > 0) {
        setHash(null);
        setSuccess(null);
        setError(null);
        try {
          const collateralWei = tokenToDecimals(collateral, collDec);
          const tokensWei = tokenToDecimals(tokens, 18);

          /** Txn WITH UMA Dev Mining Tagging - start */
          const functionParams = [
            { rawValue: collateralWei.toString() },
            { rawValue: tokensWei.toString() },
          ];
          const taggedData = tag(perp, "create", functionParams);
          const txDetails = {
            from: userAddress,
            to: perp.address,
            data: taggedData,
          };
          const tx = await provider.send("eth_sendTransaction", [txDetails]);
          setHash(tx as string);
          await provider.waitForTransaction(tx);
          /** Txn WITH UMA Dev Mining Tagging - end */

          setSuccess(true);
        } catch (error) {
          console.error(error);
          setError(error);
        }
      } else {
        setError(new Error("Collateral and Token amounts must be positive"));
      }
    };

    if (hasPendingWithdraw) {
      return (
        <Box py={2}>
          <Typography>
            <i>
              You need to cancel or execute your pending withdrawal request
              before submitting other position management transactions.
            </i>
          </Typography>
        </Box>
      );
    } else {
      return (
        <Box>
          <Grid container spacing={3} direction="row">
            <Grid item md={6}>
              <Grid container spacing={3} direction="column">
                <Grid item style={{ margin: "0px 12%" }}>
                  <Grid item md={12}>
                    Step 1: Mint Y Dollars using{" "}
                    {/* {weth &&
                      collAddress?.toLowerCase() ==
                        weth.address.toLowerCase() && <>ETH</>}{" "}
                    {collAddress?.toLowerCase() == REN_BTC_ADDRESS && <>BTC</>} */}
                    <br></br>
                    <br></br>
                    <TextField
                      fullWidth
                      type="number"
                      variant="outlined"
                      label={`Collateral (${collSymbol})`}
                      inputProps={{ min: "0", max: balance }}
                      value={collateral}
                      error={balanceBelowCollateralToDeposit}
                      helperText={
                        balanceBelowCollateralToDeposit &&
                        `${collSymbol} balance is too low`
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCollateral(e.target.value);
                        // setTokens("0");
                      }}
                      onKeyUp={() => {
                        setTokensToMax(
                          gcr,
                          collateralNum,
                          resultantCollateral,
                          posTokens,
                          posCollateral
                        );
                        // setTokens("0");
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip placement="top" title="Maximum collateral">
                              <Button
                                fullWidth
                                onClick={() => setCollateralToMax()}
                              >
                                <MinLink>Max</MinLink>
                              </Button>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item style={{ margin: "0px 12%" }}>
                  <Grid item md={12}>
                    <TextField
                      fullWidth
                      type="number"
                      variant="outlined"
                      label={`Tokens (${tokenSymbol})`}
                      inputProps={{ min: "0" }}
                      value={tokens}
                      error={resultantTokensBelowMin}
                      helperText={
                        resultantTokensBelowMin &&
                        `Below minimum of ${minSponsorTokensFromWei}`
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setTokens(e.target.value)
                      }
                      onKeyUp={() => {
                        setBackingCollateralToMin(
                          gcr,
                          tokensNum,
                          resultantTokens,
                          posTokens,
                          posCollateral
                        );
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip
                              placement="top"
                              title="Maximum amount of tokens with entered collateral"
                            >
                              <Button
                                fullWidth
                                onClick={() =>
                                  setTokensToMax(
                                    gcr,
                                    collateralNum,
                                    resultantCollateral,
                                    posTokens,
                                    posCollateral
                                  )
                                }
                              >
                                <MinLink>Max</MinLink>
                              </Button>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid item style={{ margin: "0px 12%" }}>
                  <Grid item md={12}>
                    <Box py={0}>
                      {needAllowance && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={setMaxAllowance}
                          style={{ height: "56px" }}
                        >
                          Max Approve
                        </Button>
                      )}
                      {!needAllowance && (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={mintTokens}
                          style={{ maxHeight: "56px" }}
                          disabled={
                            // cannotMint ||
                            balanceBelowCollateralToDeposit ||
                            resultantCRBelowRequirement ||
                            resultantTokensBelowMin ||
                            collateralToDeposit < 0 ||
                            tokensToCreate <= 0
                          }
                        >
                          {`Create ${tokensToCreate} ${tokenSymbol} with ${collateralToDeposit} ${collSymbol}`}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <br></br>
            </Grid>
          </Grid>
          <br></br>
          {hash && (
            <Box py={2}>
              <Typography>
                <strong>Tx Receipt: </strong>
                {hash ? (
                  <Link
                    href={getEtherscanUrl(hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {hash}
                  </Link>
                ) : (
                    hash
                  )}
              </Typography>
            </Box>
          )}
          {success && (
            <Box py={2}>
              <Typography>
                <strong>Transaction successful!</strong>
              </Typography>
            </Box>
          )}
          {error && (
            <Box pt={2}>
              <Typography>
                <span style={{ color: "red" }}>{error.message}</span>
              </Typography>
            </Box>
          )}
        </Box>
      );
    }
  } else {
    return (
      <Box py={2} textAlign="center">
        <Typography>
          {perp === null ? (
            <i>
              Please first connect to Mainnet, and then select Asset from the dropdown above.
            </i>
          ) : (
              <i>Loading...</i>
            )}
        </Typography>
      </Box>
    );
  }
};

export default Create;
