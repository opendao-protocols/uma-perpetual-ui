import dynamic from "next/dynamic";
import styled from "styled-components";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import Connection from "../../containers/Connection";
import Link from "next/link";

// Jazzicon library does some stuff that breaks SSR, so we disable it here
// const Identicon = dynamic(() => import("./Identicon"), {
//   ssr: false,
// });

interface IProps {
  styled: {
    connected: boolean;
  };
}

const ConnectButton = styled(Button)`
  padding-top: 8px;
  padding-bottom: 8px;
  background: #14142b;
  border-radius: 117.5px;
  color: #e4e5e8 !important;
  line-height: 141.44%;
  box-shadow: none;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.3px;
  margin-right: 2em;
  padding: 0.55rem 1.2rem;
  border: none;
  text-transform: uppercase;
  font-family: Formular-Medium, "IBM Plex Mono", "-apple-system",
    "BlinkMacSystemFont", '"Segoe UI"', "sans-serif";
  pointer-events: ${({ styled }: IProps) =>
    styled.connected ? "none" : "unset"};
  ${({ styled }: IProps) => styled.connected && "background-color: #14142b;"}
`;

const AddressBox = styled.div`
  background: #14142b;
  border-radius: 117.5px;
  color: #e4e5e8 !important;
  line-height: 141.44%;
  box-shadow: none;
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.3px;
  margin-right: 2em;
  padding: 0.55rem 1.2rem;
  border: none;
  font-family: Formular-Medium, "IBM Plex Mono", "-apple-system",
    "BlinkMacSystemFont", '"Segoe UI"', "sans-serif";
`;

const Header = () => {
  const { connect, signer, network, address } = Connection.useContainer();
  const connected = signer !== null;

  const networkName = network?.name === "homestead" ? "mainnet" : network?.name;
  const shortAddress = `${address?.substr(0, 5)}…${address?.substr(-4)}`;

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box>
        <a href="https://opendao.io" target="_blank">
          <img
            src="/opendao-logo.png"
            alt="OpenDAO logo"
            style={{ maxWidth: "180px" }}
          />
        </a>
      </Box>
      <Box display="flex" alignItems="center">
        {address && (
          <AddressBox title={address || undefined}>
            <div>{shortAddress}</div>
          </AddressBox>
        )}
        {connected ? (
          <ConnectButton variant="outlined" styled={{ connected }}>
            <span
              style={{
                color: "#6e62ff",
                fontSize: "1.4em",
                marginRight: "0.1em",
              }}
            >
              ●
            </span>
            &nbsp;
            {networkName}
          </ConnectButton>
        ) : (
          <ConnectButton
            variant="contained"
            onClick={connect}
            styled={{ connected }}
          >
            🦊 Connect
          </ConnectButton>
        )}
      </Box>
    </Box>
  );
};

export default Header;
