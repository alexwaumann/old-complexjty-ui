/*
 * USER SERVICE
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { balanceOfAll, SupportedToken } from "./tokens";

import { wallet } from "./wallet";

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

// we should probably keep an instance of wallet? maybe?
// using globals like this is kind of icky
class User {
  public get state() { return useUser.getState() }
  public subscribe = useUser.subscribe;
  public setState = useUser.setState;

  public start(): void {
    wallet.subscribe((state) => state.isAccountConnected, (isAccountConnected) => {
      isAccountConnected ? this.connect(wallet.state.account as string) : this.disconnect();
    });
  }

  public async connect(account: string): Promise<boolean> {
    if(this.state.isConnected || this.state.isConnecting) return false;
    this.setState({ isConnecting: true });

    // TODO: check if user still has an active verified session
    const verified = true;

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

    // TODO: update balances periodically
    const balances = await balanceOfAll(account);
    if(balances !== null) {
      this.setState({ balances });
    }
    
    this.setState({
      isConnecting: false,
      isConnected: true,
      isVerified: verified,
      data: {
        address: account,
        username,
        rank,
        pfp,
      },
    })

    return true;
  }

  public disconnect(): void {
    this.setState({
      isConnected: false,
      isVerified: false,
      data: undefined,
      balances: { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 },
    });
  }
}

export const user = new User();
