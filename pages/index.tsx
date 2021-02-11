import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Container,
  Box,
  Typography,
  Tab,
  Tabs,
  Hidden,
  Button,
  Menu,
  MenuItem,
  Grid,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

import PerpAddresses from "../containers/PerpAddresses";
import Collateral from "../containers/Collateral";
import Header from "../features/core/Header";
import Footer from "../features/core/Footer";
import PerpSelector from "../features/perp-selector/PerpSelector";
import Create from "../features/manage-position/Create";
import ManagePosition from "../features/manage-position/ManagePosition";

const StyledTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    border-bottom: 1px solid #999;
    width: 200%;
  }
  & .Mui-selected {
    font-weight: bold;
  }
  padding-bottom: 2rem;
`;

export default function Index() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>(
    "Mint y-Dollars"
  );
  const [options, setOptions] = useState<Array<string>>([]);
  const { perpAddress } = PerpAddresses.useContainer();
  const { address: collAddress } = Collateral.useContainer();

  const buildOptionsList = () => {
    // Default list that all contracts have.
    let menuOptions = ["Mint y-Dollars", "My Positions"];

    // Update selected page if the user toggles between Perps while selected on
    // invalid pages (i.e on Wrap/Unwrap then moves to uUSDrBTC).
    if (menuOptions.indexOf(selectedMenuItem) == -1) {
      setSelectedMenuItem("Mint y-Dollars");
    }
    return menuOptions;
  };

  useEffect(() => {
    setOptions(buildOptionsList());
  }, [perpAddress, collAddress, selectedMenuItem]);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (index: number) => {
    setAnchorEl(null);
    setSelectedMenuItem(options[index]);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <PerpSelector />
        <Hidden only={["sm", "xs"]}>
          <StyledTabs
            value={options.indexOf(selectedMenuItem)}
            onChange={(_, index) => handleMenuItemClick(index)}
          >
            {options.map((option, index) => (
              <Tab key={index} label={option} disableRipple />
            ))}
          </StyledTabs>
        </Hidden>
        <Hidden only={["md", "lg", "xl"]}>
          <div>
            <Box pt={1} pb={2}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button variant="outlined" onClick={handleClickListItem}>
                    <MenuIcon />
                  </Button>
                </Grid>
                <Grid item>
                  <Typography style={{ marginTop: `8px` }}>
                    <strong>Current page:</strong> {selectedMenuItem}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              {options.map((option, index) => (
                <MenuItem
                  key={index}
                  selected={index === options.indexOf(selectedMenuItem)}
                  onClick={(_) => handleMenuItemClick(index)}
                >
                  {option}
                </MenuItem>
              ))}
            </Menu>
          </div>
        </Hidden>
        {selectedMenuItem === "Mint y-Dollars" && <Create />}
        {selectedMenuItem === "My Positions" && <ManagePosition />}
        <Footer />
      </Box>
    </Container>
  );
}
