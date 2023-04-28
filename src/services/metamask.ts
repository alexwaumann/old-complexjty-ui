/*
 * METAMASK SERVICE
 *
 * Provides a provider and signer for a metamask wallet
 */

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers } from "ethers";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// TYPE DEFINITIONS
type Metamask = {
  ready: boolean
  onTargetChain: boolean

  account: string | undefined
  provider: ethers.BrowserProvider | undefined
  signer: ethers.JsonRpcSigner | undefined
};

// INTERNAL DATA
const RPCURL = import.meta.env.DEV ? 'http://localhost:8545' : 'https://polygon-rpc.com';
const TARGET_CHAIN_ID = 137;

export const [metamask, hooks, state] = initializeConnector<MetaMask>(
  (actions) => new MetaMask({ actions })
);

// STORE
const useMetamask = create(subscribeWithSelector<Metamask>(() => ({
  ready: false,
  onTargetChain: false,

  account: undefined,
  provider: undefined,
  signer: undefined,
})));

export const getMetmaskData = useMetamask.getState;
const setMetmaskData = useMetamask.setState;

export const metamaskOnTargetChainSelector = (state: Metamask) => state.onTargetChain;
export const metamaskAccountSelector = (state: Metamask) => state.account;
export const metamaskSignerSelector = (state: Metamask) => state.signer;

// METHODS
const initState = async (account: string, chainId: number) => {
  if(metamask.provider === undefined) {
    console.error('NO PROVIDER: FAILED TO INITIALIZE');
    return;
  };

  const provider = new ethers.BrowserProvider(metamask.provider as ethers.Eip1193Provider);
  const signer = await provider.getSigner();

  // update state store
  setMetmaskData({
    ready: true,
    onTargetChain: chainId === TARGET_CHAIN_ID,

    account,
    provider,
    signer,
  });

  // setup listeners
};

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

  const [accounts, chainId ] = [state.getState().accounts ,state.getState().chainId];
  if(!accounts || !chainId) return;

  initState(accounts[0], chainId);
}

export const connectWalletEagerly = async () => {
  // TODO: skip eager connect if user disconnected on last session
  await metamask.connectEagerly();

  const [accounts, chainId ] = [state.getState().accounts ,state.getState().chainId];
  if(!accounts || !chainId) return;

  initState(accounts[0], chainId);
}

export const disconnectWallet = () => {
  metamask.resetState();


  // reset state
};

// TODO: a toast message when user is not connected to correct network

// UTILS
