import styled from "styled-components";
import {
  Box,
  useMediaQuery,
  InputBase,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
} from "@material-ui/core";
import { withStyles, useTheme } from "@material-ui/core/styles";

import Connection from "../../containers/Connection";
import PerpAddresses from "../../containers/PerpAddresses";

const BootstrapInput = withStyles((theme) => ({
  root: {
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "#1f1f2c",
    width: `100%`,
  },
  input: {
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const FormWrapper = styled(FormControl)`
  width: 100%;
  & .MuiSelect-icon {
    right: 12px;
  }
`;

const PerpSelector = () => {
  const theme = useTheme();
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const { signer } = Connection.useContainer();
  const { perpAddress, setPerpAddress, perps, loading } = PerpAddresses.useContainer();

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value;
    setPerpAddress(value === 0 ? null : (value as string));
  };

  const noPerpsOrLoading = perps.length < 1 || loading;
  return (
    <Box py={2}>
      <FormWrapper>
        <Select
          value={noPerpsOrLoading || perpAddress === null ? 0 : perpAddress}
          onChange={handleChange}
          input={<BootstrapInput />}
          disabled={noPerpsOrLoading}
        >
          {!signer ? (
            <MenuItem value={0}>
              <ListItemText
                primary="Not connected"
                secondary="You must connect your wallet first"
              />
            </MenuItem>
          ) : (
              <MenuItem value={0} disabled={true}>
                <ListItemText
                  primary={loading ? "Please wait" : "Select Asset"}
                />
              </MenuItem>
            )}
          {perps.map((perp) => {
            return (
              <MenuItem value={perp.address} key={perp.address}>
                <ListItemText
                  primary={largeScreen ? perp.name : perp.symbol}
                />
              </MenuItem>
            );
          })}
        </Select>
      </FormWrapper>
    </Box>
  );
};

export default PerpSelector;
