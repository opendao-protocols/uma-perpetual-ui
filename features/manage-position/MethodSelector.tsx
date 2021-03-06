import styled from "styled-components";
import Box from "@material-ui/core/Box";
import { withStyles } from "@material-ui/core/styles";

import InputBase from "@material-ui/core/InputBase";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import ListItemText from "@material-ui/core/ListItemText";
import { Method } from "./ManagePosition";

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
    position: "relative",
    transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    backgroundColor: "rgba(255, 255, 255, 0.09)",
    borderTopLeftRadius: "4px",
    borderTopRightRadius: "4px",
    maxWidth: `500px`,
  },
  input: {
    display: "flex",
    paddingLeft: "16px",
    alignItems: "center",
  },
}))(InputBase);

const FormWrapper = styled(FormControl)`
  width: 100%;
`;

interface IProps {
  method: Method;
  handleChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
}

const MethodSelector = ({ method, handleChange }: IProps) => {
  return renderComponent();

  function renderComponent() {
    return (
      <Box py={2}>
        <FormWrapper>
          <InputLabel id="demo-simple-select-label">Actions</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            value={method}
            onChange={handleChange}
            input={<BootstrapInput />}
          >
            <MenuItem key={"redeem"} value={"redeem"}>
              <ListItemText
                primary="Redeem"
                secondary="Redeem synthetics for collateral."
              />
            </MenuItem>
            <MenuItem key={"deposit"} value={"deposit"}>
              <ListItemText
                primary="Deposit"
                secondary="Add to position collateral."
              />
            </MenuItem>
            <MenuItem key={"withdraw"} value={"withdraw"}>
              <ListItemText
                primary="Withdraw"
                secondary="Remove position collateral"
              />
            </MenuItem>
          </Select>
        </FormWrapper>
      </Box>
    );
  }
};

export default MethodSelector;
