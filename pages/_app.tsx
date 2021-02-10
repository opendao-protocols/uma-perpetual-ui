import App from "next/app";
import Head from "next/head";

import "../utils/global.css";

import { ApolloProvider } from "@apollo/client";
import { WithStylingProviders } from "../utils/styling";
import Connection from "../containers/Connection";
import PerpAddresses from "../containers/PerpAddresses";
import PerpContract from "../containers/PerpContract";
import PerpState from "../containers/PerpState";
import Token from "../containers/Token";
import Collateral from "../containers/Collateral";
import Position from "../containers/Position";

import { client } from "../apollo/client";

interface IProps {
  children: React.ReactNode;
}

const WithStateContainerProviders = ({ children }: IProps) => (
  <ApolloProvider client={client}>
    <Connection.Provider>
      <PerpAddresses.Provider>
        <PerpContract.Provider>
          <PerpState.Provider>
            <Token.Provider>
              <Collateral.Provider>
                <Position.Provider>
                  {children}
                </Position.Provider>
              </Collateral.Provider>
            </Token.Provider>
          </PerpState.Provider>
        </PerpContract.Provider>
      </PerpAddresses.Provider>
    </Connection.Provider>
  </ApolloProvider>
)

export default class MyApp extends App {
  componentDidMount() {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentNode?.removeChild(jssStyles);
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>OpenDAO UMA yDollar</title>
          <meta
            name="viewport"
            content="minimum-scale=1, initial-scale=1, width=device-width"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,700;1,400&display=swap"
            rel="stylesheet"
          />
          <link rel="icon" type="image/x-icon" href="favicon.png" />
        </Head>

        <WithStylingProviders>
          <WithStateContainerProviders>
            <Component {...pageProps} />
          </WithStateContainerProviders>
        </WithStylingProviders>
      </>
    );
  }
}
