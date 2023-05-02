/*
 * METAMASK SERVICE
 */

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type MetaMaskEthereumProvider = {
  isMetaMask?: boolean;
  once(eventName: string | symbol, listener: (...args: any[]) => void): MetaMaskEthereumProvider
  on(eventName: string | symbol, listener: (...args: any[]) => void): MetaMaskEthereumProvider
  off(eventName: string | symbol, listener: (...args: any[]) => void): MetaMaskEthereumProvider
  addListener(eventName: string | symbol, listener: (...args: any[]) => void): MetaMaskEthereumProvider
  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): MetaMaskEthereumProvider
  removeAllListeners(event?: string | symbol): MetaMaskEthereumProvider
};

type RequestArguments = {
  method: string;
  params?: unknown[] | object;
};

type Provider = MetaMaskEthereumProvider & {
  request: (args: RequestArguments) => Promise<any>
}

declare global {
  interface Window {
    ethereum?: Provider;
  }
};

type WalletState = {
  isActive: boolean
  isActivating: boolean
  hasNoMetamaskError: boolean

  provider: ethers.BrowserProvider | undefined
  injectedProvider: Provider | undefined
  onTargetChain: boolean 

  isAccountConnected: boolean
  isAccountConnecting: boolean

  account: string | undefined
  signer: ethers.JsonRpcSigner | undefined
};

export const useWallet = create(subscribeWithSelector<WalletState>(() => ({
  isActive: false,
  isActivating: false,
  hasNoMetamaskError: false,

  provider: undefined,
  injectedProvider: undefined,
  onTargetChain: false,

  isAccountConnected: false,
  isAccountConnecting: false,

  account: undefined,
  signer: undefined,
})));

const setWalletState = useWallet.setState;
const getWalletState = useWallet.getState;

class Wallet {
  private targetChainId: number = 137;

  private onChainChanged(chainIdHex: string): void {
    const chainId = parseInt(chainIdHex, 16);
    setWalletState({ onTargetChain: chainId === this.targetChainId });
  }

  private onAccountsChanged([account]: string[]): void {
    if(account === undefined) {
      // todo: handle account disconnected
      return;
    }

    // todo: handle account connected and/or switched
  }

  public async start(): Promise<void> {
    const { isActive, isActivating } = getWalletState();
    if(isActive || isActivating) return;

    setWalletState({ isActivating: true });

    const injectedProvider = await detectEthereumProvider<Provider>();
    if(injectedProvider === null) {
      setWalletState({ isActivating: false, hasNoMetamaskError: true });
      console.warn('COMPLEXJTY: NO INJECTED WALLET FOUND');
      return;
    } else if(injectedProvider !== window.ethereum) {
      // todo: we should handle this differently
      setWalletState({ isActivating: false, hasNoMetamaskError: true });
      console.warn('COMPLEXJTY: MULTIPLE INJECTED WALLETS');
      return;
    }

    injectedProvider.removeAllListeners();
    injectedProvider.on('chainChanged', this.onChainChanged);
    injectedProvider.on('accountsChanged', this.onAccountsChanged);

    const provider = new ethers.BrowserProvider(injectedProvider as ethers.Eip1193Provider);
    const chainId = await provider.getNetwork().then((network) => Number(network.chainId));
    setWalletState({
      isActive: true,
      isActivating: false,
      provider,
      injectedProvider,
      onTargetChain: chainId === this.targetChainId,
    });
  }

  public stop(): void {
    getWalletState().injectedProvider?.removeAllListeners();
    getWalletState().provider?.removeAllListeners();

    setWalletState({
      isActive: false,
      isActivating: false,
      provider: undefined,
      injectedProvider: undefined,
      onTargetChain: false,
    });
  }

  /**
   * Send metamask a request to view user's wallet address
  */
  public async connect(): Promise<void> {
    const { isAccountConnected, isAccountConnecting, provider } = getWalletState();
    if(isAccountConnected || isAccountConnecting) return;

    setWalletState({ isAccountConnecting: true });

    const [account] = await provider?.send('eth_requestAccounts', [])
      .catch(() => []);
    console.log(`account: ${account}`);
    console.log(account);

    setWalletState({isAccountConnecting: false});
  }

  /**
   * Send metamask a request to prompt user to switch to correct network
  */
  public fixNetwork(): void {
  }
};

export const wallet: Wallet = new Wallet();
