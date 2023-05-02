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

class Wallet {
  private targetChainId: number = 137;

  public get state() { return useWallet.getState() }
  public subscribe = useWallet.subscribe;
  private setState = useWallet.setState;

  public async start(): Promise<void> {
    if(this.state.isActive || this.state.isActivating) return;

    this.setState({ isActivating: true });

    const injectedProvider = await detectEthereumProvider<Provider>();
    if(injectedProvider === null) {
      this.setState({ isActivating: false, hasNoMetamaskError: true });
      console.warn('COMPLEXJTY: NO INJECTED WALLET FOUND');
      return;
    } else if(injectedProvider !== window.ethereum) {
      // todo: we should handle this differently
      this.setState({ isActivating: false, hasNoMetamaskError: true });
      console.warn('COMPLEXJTY: MULTIPLE INJECTED WALLETS');
      return;
    }

    injectedProvider.removeAllListeners();
    injectedProvider.on('chainChanged', (chainIdHex: string) => this.onChainChanged(chainIdHex));
    injectedProvider.on('accountsChanged', (accounts: string[]) => this.onAccountsChanged(accounts));

    const provider = new ethers.BrowserProvider(injectedProvider as ethers.Eip1193Provider);
    const chainId = await provider.getNetwork().then((network) => Number(network.chainId));
    this.setState({
      isActive: true,
      isActivating: false,
      provider,
      injectedProvider,
      onTargetChain: chainId === this.targetChainId,
    });

  }

  public stop(): void {
    this.state.injectedProvider?.removeAllListeners();
    this.state.provider?.removeAllListeners();

    this.setState({
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
    if(this.state.isAccountConnected || this.state.isAccountConnecting) return;

    this.setState({ isAccountConnecting: true });

    const [account] = await this.state.provider?.send('eth_requestAccounts', []).catch(() => []);
    if(account === undefined) {
      this.setState({ isAccountConnecting: false });
      return;
    }

    const signer = await this.state.provider?.getSigner(account);

    this.setState({
      isAccountConnected: true,
      isAccountConnecting: false,
      account,
      signer,
    });
  }

  /**
   * Send metamask a request to prompt user to switch to correct network
  */
  public fixNetwork(): void {
  }

  private onChainChanged(chainIdHex: string): void {
    const chainId = parseInt(chainIdHex, 16);
    this.setState({ onTargetChain: chainId === this.targetChainId });
  }

  private onAccountsChanged([account]: string[]): void {
    this.setState({
      isAccountConnected: false,
      isAccountConnecting: false,
      account: undefined,
      signer: undefined,
    });

    if(account === undefined) return;

    this.connect();
  }
};

export const wallet: Wallet = new Wallet();
