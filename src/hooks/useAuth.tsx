import { create } from "zustand";

import { metamaskAccountSelector, useMetamask } from "../services/metamask";
import { balanceOfAll, SupportedTokenMap } from "../services/tokens";

interface AuthState {
  connected: boolean
  verified: boolean

  address: string | null
  username: string | null
  rank: string | null

  pfp: { url: string, rarity: string, attributes: string[] } | null

  balances: SupportedTokenMap<number>
};

// const useAuth = create<AuthState>((set, get) => ({
const useAuth = create<AuthState>(() => ({
  // AUTH STATE
  connected: false,
  verified: false,

  // USER DATA
  address: null,
  username: null,
  rank: null,

  pfp: null,

  balances: { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 },
}));

export default useAuth;

// METHODS

// SUBSCRIPTIONS
useMetamask.subscribe(metamaskAccountSelector, (account, previousAccount) => {
  if(account !== undefined && previousAccount === undefined) {
    // handle account connected
    handleOnConnect(account)
  } else if (account === undefined && previousAccount !== undefined) {
    // handle account disconnected
    handleOnDisconnect();
  } else if (account !== undefined && account !== undefined) {
    handleOnConnect(account);
  }
});

// HANDLERS
const handleOnConnect = (address: string) => {
  const connected = true;

  // TODO: check if user is verified
  const verified = true;

  // TODO: get username from registry (may not have one)
  const username = 'Godyl';

  // TODO: get rank from server
  // bronze, silver, gold, platinum, diamond, master, luminary (top 100), god (#1)
  const rank = 'Platinum';

  // TODO: get pfp from registry (may not have one) - we should default to null and handle in component
  const pfp = {
    url: '/placeholder-pfp.png',
    rarity: 'Mythic',
    attributes: []
  };

  balanceOfAll(address).then((balances) => {
    if(balances === null) return;
    useAuth.setState({ balances });
  });

  useAuth.setState({ connected, verified, address, username, rank, pfp });
};

const handleOnDisconnect = () => {
  useAuth.setState({
    connected: false,
    verified: false,
    address: null,
    username: null,
    rank: null,
    pfp: null,
  });
};
