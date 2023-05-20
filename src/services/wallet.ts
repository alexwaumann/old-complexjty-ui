/*
 * METAMASK SERVICE
 */

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import { useEffect } from 'react';
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
type RequestArguments = { method: string, params?: unknown[] | object };
type EthereumProvider = MetaMaskEthereumProvider & { request: (args: RequestArguments) => Promise<any> }
declare global { interface Window { ethereum?: EthereumProvider } };

const DEV_RPC_URLS: string[] = ['http://localhost:8545'];
const PROD_RPC_URLS: string[] = ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'];

type WalletState = {
  isActive: boolean
  isActivating: boolean
  hasNoMetamaskError: boolean

  provider: ethers.BrowserProvider | undefined
  injectedProvider: EthereumProvider | undefined
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

export const useWalletService = () => {
  useEffect(() => {
    wallet.start();
    return () => wallet.stop();
  });
};

export class Wallet {
  private targetChainId: number = 137;
  private rpcUrls = import.meta.env.DEV ? DEV_RPC_URLS : PROD_RPC_URLS;

  public selectors = {
    isActive: (state: WalletState) => state.isActive,
    isActivating: (state: WalletState) => state.isActivating,
    hasNoMetamaskError: (state: WalletState) => state.hasNoMetamaskError,
    provider: (state: WalletState) => state.provider,
    injectedProvider: (state: WalletState) => state.injectedProvider,
    onTargetChain: (state: WalletState) => state.onTargetChain,
    isAccountConnected: (state: WalletState) => state.isAccountConnected,
    isAccountConnecting: (state: WalletState) => state.isAccountConnecting,
    account: (state: WalletState) => state.account,
    signer: (state: WalletState) => state.signer,
  };

  public get state(): WalletState { return useWallet.getState() }
  private set state(newState: Parameters<typeof useWallet.setState>[0]) { useWallet.setState(newState) }
  public subscribe = useWallet.subscribe;

  public async start(): Promise<void> {
    if(this.state.isActive || this.state.isActivating) return;

    this.state = { isActivating: true };

    const injectedProvider = await detectEthereumProvider<EthereumProvider>();
    if(injectedProvider === null) {
      this.state = { isActivating: false, hasNoMetamaskError: true };
      console.warn('COMPLEXJTY: NO INJECTED WALLET FOUND');
      return;
    } else if(injectedProvider !== window.ethereum) {
      // todo: we should handle this differently
      this.state = ({ isActivating: false, hasNoMetamaskError: true });
      console.warn('COMPLEXJTY: MULTIPLE INJECTED WALLETS');
      return;
    }

    injectedProvider.removeAllListeners();
    injectedProvider.on('chainChanged', (chainIdHex: string) => this.onChainChanged(chainIdHex));
    injectedProvider.on('accountsChanged', (accounts: string[]) => this.onAccountsChanged(accounts));

    const provider = new ethers.BrowserProvider(injectedProvider as ethers.Eip1193Provider);
    const chainId = await provider.getNetwork().then((network) => Number(network.chainId));
    this.state = ({
      isActive: true,
      isActivating: false,
      provider,
      injectedProvider,
      onTargetChain: chainId === this.targetChainId,
    });

    // connect eagerly if user previously connected and didn't disconnect
    const [account] = await provider.send('eth_accounts', []).catch(() => []);
    if(!this.shouldEagerlyConnect || account === undefined) return;
    this.connect();
  }

  public stop(): void {
    this.state.injectedProvider?.removeAllListeners();
    this.state.provider?.destroy();

    this.state = ({
      isActive: false,
      isActivating: false,
      provider: undefined,
      injectedProvider: undefined,
      onTargetChain: false,
      isAccountConnected: false,
      isAccountConnecting: false,
      account: undefined,
      signer: undefined,
    });
  }

  /**
   * Send metamask a request to view user's wallet address
  */
  public async connect(): Promise<void> {
    const { isActive, isAccountConnected, isAccountConnecting } = this.state;
    if(!isActive || isAccountConnected || isAccountConnecting) return;

    this.state = { isAccountConnecting: true };

    const [account] = await this.state.provider?.send('eth_requestAccounts', []).catch(() => []);
    if(account === undefined) {
      this.state = ({ isAccountConnecting: false });
      return;
    }

    const signer = await this.state.provider?.getSigner(account).catch(() => undefined);
    if(signer === undefined) {
      console.warn('COMPLEXJTY: FAILED TO GET SIGNER');
      this.state = ({ isAccountConnecting: false });
      return;
    }

    this.shouldEagerlyConnect = true;
    this.state = {
      isAccountConnected: true,
      isAccountConnecting: false,
      account: ethers.getAddress(account),
      signer,
    };
  }

  public disconnect(): void {
    this.shouldEagerlyConnect = false;
    this.state = {
      isAccountConnected: false,
      isAccountConnecting: false,
      account: undefined,
      signer: undefined,
    };
  }

  /**
   * Send metamask a request to prompt user to switch to correct network
  */
  public async fixNetwork(): Promise<void> {
    if(!this.state.isActive || this.state.onTargetChain) return;

    const error = await this.state.provider
      ?.send('wallet_switchEthereumChain', [{ chainId: '0x89' }])
      .catch((error) => error);
    if(error === null || error?.error?.code !== 4902) return;

    await this.state.provider?.send('wallet_addEthereumChain', [{
      chainName: 'Polygon Mainnet',
      chainId: '0x89',
      rpcUrls: this.rpcUrls,
      blockExplorerUrls: ['https://polygonscan.com'],
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      },
    }]).catch(() => undefined);
  }

  private async onChainChanged(chainIdHex: string): Promise<void> {
    const chainId = parseInt(chainIdHex, 16);
    this.state = { onTargetChain: chainId === this.targetChainId };

    // recreate provider
    this.state.provider?.destroy();
    const provider = new ethers.BrowserProvider(this.state?.injectedProvider as ethers.Eip1193Provider);
    this.state = { provider };

    // recreate signer if account is connected
    if(!this.state.isAccountConnected) return;
    const signer = await provider.getSigner(this.state.account).catch(() => undefined);
    if(signer === undefined) {
      this.disconnect();
      console.warn('COMPLEXJTY: FAILED TO GET SIGNER');
      return;
    }

    this.state = { signer };
  }

  private onAccountsChanged([account]: string[]): void {
    this.disconnect();
    if(account !== undefined) this.connect();
  }

  private get shouldEagerlyConnect(): boolean {
    const shouldEagerlyConnectString = localStorage.getItem('walletShouldEagerlyConnect');
    if(shouldEagerlyConnectString === null) return false;

    let shouldEagerlyConnect: boolean;
    try {
      shouldEagerlyConnect = JSON.parse(shouldEagerlyConnectString);
      if(typeof shouldEagerlyConnect !== 'boolean') {
        this.shouldEagerlyConnect = false;
        return false;
      };
    } catch {
      this.shouldEagerlyConnect = false;
      return false;
    }
    return shouldEagerlyConnect;
  }

  private set shouldEagerlyConnect(value: boolean) {
    localStorage.setItem('walletShouldEagerlyConnect', JSON.stringify(value));
  }
};

export const wallet: Wallet = new Wallet();
