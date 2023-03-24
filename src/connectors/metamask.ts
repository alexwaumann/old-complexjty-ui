import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

export const [metamask, hooks, state] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

export const {
  useAccount,
  useChainId,
  useIsActivating,
  useIsActive,
  useProvider,
} = hooks;

/*
 * TODO
 * Update auth state when things change here, including when the values are first set
 * Handle errors for user rejecting switch network
 */

export const connectWallet = async () => {
  await metamask.activate({
    chainName: 'Polygon Mainnet',
    chainId: 137,
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
  });
};

export const connectEagerly = () => {
  metamask.connectEagerly()
    .then(() => {
      if(metamask.provider === undefined) return;

      metamask.provider.on('chainChanged', onChainIdChanged);
      metamask.provider.on('accountsChanged', onAccountsChanged);
    });
};

const onChainIdChanged = (chainIdHex: string) => {
  const chainId = Number.parseInt(chainIdHex, 16);
  console.log(`LISTENER: chainId: ${chainId}`);
};

const onAccountsChanged = (accounts: string[]) => {
  const account = accounts[0];
  console.log(`LISTENER: account: ${account}`);
};
