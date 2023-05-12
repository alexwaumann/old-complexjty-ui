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
type RequestArguments = { method: string, params?: unknown[] | object };
type EthereumProvider = MetaMaskEthereumProvider & { request: (args: RequestArguments) => Promise<any> }
declare global { interface Window { ethereum?: EthereumProvider } };

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

class Wallet {
  private targetChainId: number = 137;
  private devRpcUrls = ['http://localhost:8545'];
  private prodRpcUrls = ['https://polygon-rpc.com', 'https://polygon.llamarpc.com'];

  public get state() { return useWallet.getState() }
  public subscribe = useWallet.subscribe;
  private setState = useWallet.setState;

  public async start(): Promise<void> {
    if(this.state.isActive || this.state.isActivating) return;

    this.setState({ isActivating: true });

    const injectedProvider = await detectEthereumProvider<EthereumProvider>();
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

    // connect eagerly if user previously connected and didn't disconnect
    const [account] = await provider.send('eth_accounts', []).catch(() => []);
    if(!this.shouldEagerlyConnect || account === undefined) return;
    this.connect();
  }

  public stop(): void {
    this.state.injectedProvider?.removeAllListeners();
    this.state.provider?.destroy();

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
    const { isActive, isAccountConnected, isAccountConnecting } = this.state;
    if(!isActive || isAccountConnected || isAccountConnecting) return;

    this.setState({ isAccountConnecting: true });

    const [account] = await this.state.provider?.send('eth_requestAccounts', []).catch(() => []);
    if(account === undefined) {
      this.setState({ isAccountConnecting: false });
      return;
    }

    const signer = await this.state.provider?.getSigner(account).catch(() => undefined);
    if(signer === undefined) {
      console.warn('COMPLEXJTY: FAILED TO GET SIGNER');
      this.setState({ isAccountConnecting: false });
      return;
    }

    this.shouldEagerlyConnect = true;
    this.setState({
      isAccountConnected: true,
      isAccountConnecting: false,
      account: ethers.getAddress(account),
      signer,
    });
  }

  public disconnect(): void {
    this.shouldEagerlyConnect = false;
    this.setState({
      isAccountConnected: false,
      isAccountConnecting: false,
      account: undefined,
      signer: undefined,
    });
  }

  /**
   * Send metamask a request to prompt user to switch to correct network
  */
  public async fixNetwork(): Promise<void> {
    if(!this.state.isActive || this.state.onTargetChain) return;

    const error = await this.state.provider
      ?.send('wallet_switchEthereumChain',[{ chainId: '0x89' }])
      .catch((error) => error);
    if(error === null || error?.error?.code !== 4902) return;

    await this.state.provider?.send('wallet_addEthereumChain', [{
      chainName: 'Polygon Mainnet',
      chainId: '0x89',
      rpcUrls: import.meta.env.DEV ? this.devRpcUrls : this.prodRpcUrls,
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
    this.setState({ onTargetChain: chainId === this.targetChainId });

    // recreate provider
    this.state.provider?.destroy();
    const provider = new ethers.BrowserProvider(this.state?.injectedProvider as ethers.Eip1193Provider);
    this.setState({ provider });

    // recreate signer if account is connected
    if(!this.state.isAccountConnected) return;
    const signer = await provider.getSigner(this.state.account).catch(() => undefined);
    if(signer === undefined) {
      this.disconnect();
      console.warn('COMPLEXJTY: FAILED TO GET SIGNER');
      return;
    }

    this.setState({ signer });
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
