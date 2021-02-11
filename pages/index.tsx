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
  IconButton,
  Menu,
  MenuItem,
  Grid,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

import Header from "../features/core/Header";
import PerpSelector from "../features/perp-selector/PerpSelector";
import Create from "../features/manage-position/Create";

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
  return (
    <Container maxWidth={"md"}>
      <Box py={4}>
        <Header />
        <PerpSelector />
        <Create />
      </Box>
    </Container>
  );
}
