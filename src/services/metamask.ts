/*
 * METAMASK SERVICE
 *
 * The service sets metamask listeners for 'accountsChanged' and 'chainChanged' to update
 * it's state store accordingly. 
 */

import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { ethers } from "ethers";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// SECTION: TYPE DEFINITIONS
type Metamask = {
  onTargetChain: boolean | undefined
  connecting: boolean
  error: boolean
  ready: boolean
  account: string | undefined
  provider: ethers.BrowserProvider | undefined
  signer: ethers.JsonRpcSigner | undefined
};

// SECTION: INTERNAL DATA
const [metamask] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }));
const RPCURL = import.meta.env.DEV ? 'http://localhost:8545' : 'https://polygon-rpc.com';
const TARGET_CHAIN_ID = 137;

// SECTION: STORE
export const useMetamask = create(subscribeWithSelector<Metamask>(() => ({
  onTargetChain: false,
  connecting: false,
  error: false,
  ready: false,
  account: undefined,
  provider: undefined,
  signer: undefined,
})));

export const getMetamaskData = useMetamask.getState;
export const metamaskOnTargetChainSelector = (state: Metamask) => state.onTargetChain;
export const metamaskConnectingSelector = (state: Metamask) => state.connecting;
export const metamaskErrorSelector = (state: Metamask) => state.error;
export const metamaskReadySelector = (state: Metamask) => state.ready;
export const metamaskAccountSelector = (state: Metamask) => state.account;
export const metamaskProviderSelector = (state: Metamask) => state.provider;
export const metamaskSignerSelector = (state: Metamask) => state.signer;

const setMetamaskData = useMetamask.setState;
const resetMetamaskData = () => setMetamaskData({
  onTargetChain: undefined,
  connecting: false,
  ready: false,
  error: false,
  account: undefined,
  provider: undefined,
  signer: undefined,
});

// SECTION: METHODS

/**
 * Tries to connect to wallet (failing silently). If it successfuly connects,
 * it will setup the metamask service and update the store with relevant data.
 */
export const connectWalletEagerly = async () => {
  setMetamaskData({ connecting: true });
  await metamask.connectEagerly().catch((e) => console.log(e));

  if(!setupMetamask()) return;

  // @ts-expect-error
  const account: string | null = metamask.provider.selectedAddress;
  if(!account) {
    setMetamaskData({ connecting: false });
    console.warn('COMPLEXJTY: NO ACCOUNT CONNECTED');
    return;
  };
  setMetamaskData({ account: ethers.getAddress(account) });
}

/**
 * This will not work if connectWalletEagerly has not been called
 */
export const connectWallet = () => {
  setMetamaskData({ connecting: true });
  metamask
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
    })
    .catch(() => setMetamaskData({ connecting: false }));
}

const setupMetamask = (): boolean => {
  if(metamask.provider === undefined) {
    handleNoMetamaskFoundError();
    return false;
  };

  metamask.provider.removeListener('chainChanged', handleChainChanged);
  metamask.provider.on('chainChanged', handleChainChanged);

  metamask.provider.removeListener('accountsChanged', handleAccountsChanged);
  metamask.provider.on('accountsChanged', handleAccountsChanged);

  return true;
};

// SECTION: LISTENERS
useMetamask.subscribe(metamaskAccountSelector, (account) => {
  account === undefined ? handleOnDisconnect() : handleOnConnect(account);
});

// SECTION: HANDLERS
const handleOnConnect = async (account: string) => {
  if(getMetamaskData().ready) {
    // account is already connected
    setMetamaskData({ ready: false });
  };

  const chainId = parseInt(metamask.provider?.chainId as string, 16);

  getMetamaskData().provider?.removeAllListeners();
  let provider = getMetamaskData().provider;
  if(provider === undefined) provider = new ethers.BrowserProvider(metamask.provider as ethers.Eip1193Provider);
  const signer = await provider.getSigner(account);

  setMetamaskData({
    onTargetChain: chainId === TARGET_CHAIN_ID,
    connecting: false,
    ready: true,
    error: false,
    account,
    provider,
    signer,
  });

  console.info(`COMPLEXJTY: CONNECTED TO ${account}`);
};

const handleOnDisconnect = () => {
  getMetamaskData().provider?.removeAllListeners();
  resetMetamaskData();
};

const handleChainChanged = (chainIdHex: string) => {
  const chainId = parseInt(chainIdHex, 16) as number;
  setMetamaskData({ onTargetChain: chainId === TARGET_CHAIN_ID });
};

const handleAccountsChanged = (accounts: string[]) => {
  const [account, previousAccount] = [accounts[0], getMetamaskData().account];
  if(account === previousAccount) return;

  setMetamaskData({ account });
}

const handleNoMetamaskFoundError = () => {
  console.error('COMPLEXJTY: NO METAMASK PROVIDER FOUND');
  setMetamaskData({ error: true });
};

// TODO: a toast message when user is not connected to correct network
