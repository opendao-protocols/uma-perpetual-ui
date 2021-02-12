import { useState, useEffect } from "react";
import { Box, Typography } from "@material-ui/core";

import Connection from "../../containers/Connection";
import PerpAddresses from "../../containers/PerpAddresses";
import MethodSelector from "./MethodSelector";
import Deposit from "./Deposit";
import Redeem from "./Redeem";
import Withdraw from "./Withdraw";
import YourPosition from "./YourPosition";
import YourLiquidations from "./YourLiquidations";
import YourWallet from "./YourWallet";

export type Method = "redeem" | "deposit" | "withdraw";
const DEFAULT_METHOD = "redeem";

const Manager = () => {
  const { signer } = Connection.useContainer();
  const { perpAddress } = PerpAddresses.useContainer();
  const [method, setMethod] = useState<Method>(DEFAULT_METHOD);
  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) =>
    setMethod(e.target.value as Method);

  useEffect(() => {
    setMethod(DEFAULT_METHOD);
  }, []);

  if (signer !== null && perpAddress !== null) {
    return (
      <Box my={0}>
        <YourWallet />
        <YourLiquidations />
        <YourPosition />
        <MethodSelector method={method} handleChange={handleChange} />
        {method === "redeem" && <Redeem />}
        {method === "deposit" && <Deposit />}
        {method === "withdraw" && <Withdraw />}
      </Box>
    );
  } else {
    return (
      <Box py={2} textAlign="center">
        <Typography>
          <i>
            Please first connect to Mainnet, and then select Asset from the
            dropdown above.
          </i>
        </Typography>
      </Box>
    );
  }
};

export default Manager;
