import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

export const [metamask, hooks, state] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

export const { useProvider } = hooks;

