/*
 * METAMASK SERVICE
 *
 * Provides a provider and signer for a metamask wallet
 */
import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";

const RPCURL = import.meta.env.DEV ? 'http://localhost:8545' : 'https://polygon-rpc.com';

export const [metamask, hooks, state] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// METHODS
//
export const connectWallet = async () => {
  await metamask
    .activate({
      chainName: 'Polygon Mainnet',
      chainId: 137,
      rpcUrls: [RPCURL],
      blockExplorerUrls: ['https://polygonscan.com'],
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      },
    });

  if(!state.getState().accounts || !state.getState().chainId) return;

  // create ethers provider and signer
}

export const connectWalletEagerly = async () => {
  // TODO: skip eager connect if user disconnected on last session
  await metamask.connectEagerly();

  // create ethers provider and signer
}

export const disconnectWallet = () => metamask.resetState();

// new ethers.BrowserProvider(metamask.provider);
//
//
// TODO: a toast message when user is not connected to correct network
