/*
 * USER SERVICE
 */

import { ethers } from "ethers";
import { useEffect } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { provider } from "./provider";

import { balanceOfAll, SupportedToken } from "./tokens";
import { Wallet, wallet } from "./wallet";

type PfpData = { url: string, rarity: string, attributes: string[] }
type UserData = { address: string, username: string, rank: string, pfp: PfpData }
type UserState = {
  isConnected: boolean
  isConnecting: boolean

  isVerified: boolean
  isVerifying: boolean

  data: UserData | undefined
  balances: Record<SupportedToken, number> 
}

export const useUser = create(subscribeWithSelector<UserState>(() => ({
  isConnected: false,
  isConnecting: false,

  isVerified: false,
  isVerifying: false,

  data: undefined,
  balances: { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 },
})));

export const useUserService = () => {
  useEffect(() => {
    user.start();
    return () => user.stop();
  });
};

class User {
  private unsubscribeFromWallet: (() => void) | undefined;
  private updateBalancesIntervalId: number | undefined;

  public selectors = {
    isConnected: (state: UserState) => state.isConnected,
    isConnecting: (state: UserState) => state.isConnecting,
    isVerified: (state: UserState) => state.isVerified,
    isVerifying: (state: UserState) => state.isVerifying,
    data: (state: UserState) => state.data,
    balances: (state: UserState) => state.balances,
  };

  public get state(): UserState { return useUser.getState() }
  private set state(newState: Parameters<typeof useUser.setState>[0]) { useUser.setState(newState) }
  public subscribe = useUser.subscribe;

  public start(): void {
    if(this.unsubscribeFromWallet !== undefined) return;

    this.unsubscribeFromWallet = wallet.subscribe(wallet.selectors.account, (account) => {
      account !== undefined ? this.connect(account) : this.disconnect();
    }, { fireImmediately: true });
  }

  public stop(): void {
    if(this.unsubscribeFromWallet === undefined) return;

    this.unsubscribeFromWallet();
    this.unsubscribeFromWallet = undefined;
    this.disconnect();
  }

  public async connect(account: string): Promise<void> {
    if(this.state.isConnected || this.state.isConnecting) return;
    this.state = { isConnecting: true };

    // TODO: check if user still has an active verified session
    const isVerified = true;

    // TODO: get username from registry (may not have one)
    const username = account === '0x10Df08114e07858DBEE767D7E2eCb5F488192cA8' ? 'Godyl' : 'Kaneki';

    // TODO: get rank from server
    // bronze, silver, gold, platinum, diamond, master, luminary (top 100), god (#1)
    const rank = account === '0x10Df08114e07858DBEE767D7E2eCb5F488192cA8' ? 'Master' : 'Platinum';

    // TODO: get pfp from registry (may not have one)
    const pfp: PfpData = {
      url: '/placeholder-pfp.png',
      rarity: 'Mythic',
      attributes: [],
    };

    // periodically update user balances
    this.updateBalancesIntervalId = setInterval(() => this.updateBalances(), 10000);

    this.state = {
      isConnecting: false,
      isConnected: true,
      isVerified,
      data: {
        address: account,
        username,
        rank,
        pfp,
      },
    };

    this.updateBalances();
  }

  public disconnect(): void {
    clearInterval(this.updateBalancesIntervalId);
    this.state = {
      isConnected: false,
      isVerified: false,
      data: undefined,
      balances: { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 },
    };
  }

  public async updateBalances(): Promise<void> {
    if(this.state.data === undefined) return;

    const balances = await balanceOfAll(this.state.data.address);
    if(balances === null) return;

    const shouldUpdateState = Object.keys(balances).reduce((result, token) => {
      if(this.state.balances[token as SupportedToken] !== balances[token as SupportedToken]) {
        return true;
      }
      return result;
    }, false);

    if(!shouldUpdateState) return;

    this.state = { balances };
  }
}

export const user = new User();
