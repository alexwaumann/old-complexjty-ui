/*
 * METAMASK SERVICE
 */

import { ethers } from 'ethers';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

type WalletState = {
  isActive: boolean
  isActivating: boolean
  hasNoMetamaskError: boolean

  isAccountConnected: boolean
  isAccountConnecting: boolean

  onTargetChain: boolean 
  account: string | undefined
  provider: ethers.BrowserProvider | undefined
  signer: ethers.JsonRpcSigner | undefined
};

export const useWallet = create(subscribeWithSelector<WalletState>(() => ({
  isActive: false,
  isActivating: false,
  hasNoMetamaskError: false,

  isAccountConnected: false,
  isAccountConnecting: false,

  onTargetChain: false,
  account: undefined,
  provider: undefined,
  signer: undefined,
})));

const setWalletState = useWallet.setState;
const getWalletState = useWallet.getState;

class Wallet {
  constructor() {
  }

  private onChainChanged(chainIdHex: string): void {
  }

  private onAccountsChanged(accounts: string[]): void {
  }

  public start(): void {
  }

  public stop(): void {
  }

  /**
   * Send metamask a request to view user's wallet address
  */
  public connect(): void {
  }

  /**
   * Send metamask a request to prompt user to switch to correct network
  */
  public fixNetwork(): void {

  }
};

export const metamask: Wallet = new Wallet();
