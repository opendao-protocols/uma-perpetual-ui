import { Box, Typography, IconButton } from "@material-ui/core";

const Footer = () => {
  return (
    <Box py={4} textAlign="center">
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://github.com/opendao-protocols/uma-perpetual-ui"
        size="medium"
      >
        <img
          src="/social-media-icons/github.png"
          className="social-media-icons"
        />
      </IconButton>
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://twitter.com/opendaoprotocol"
        size="medium"
      >
        <img
          src="/social-media-icons/twitter.png"
          className="social-media-icons"
        />
      </IconButton>
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://discord.com/invite/SpFwJRr"
        size="medium"
      >
        <img
          src="/social-media-icons/discord.png"
          className="social-media-icons"
        />
      </IconButton>
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://t.me/opendao"
        size="medium"
      >
        <img
          src="/social-media-icons/telegram.png"
          className="social-media-icons"
        />
      </IconButton>
      <IconButton
        style={{ marginRight: `8px` }}
        target="_blank"
        href="https://medium.com/opendao"
        size="medium"
      >
        <img
          src="/social-media-icons/medium.png"
          className="social-media-icons"
        />
      </IconButton>
      <Typography style={{ marginTop: `8px` }}>
        <strong>Built on </strong>
        <a href="https://umaproject.org/" target="_blank">
          <img
            src="/uma-logo.svg"
            alt="UMA logo"
            style={{ maxWidth: "42px" }}
          />
        </a>
      </Typography>
    </Box>
  );
};

export default Footer;
