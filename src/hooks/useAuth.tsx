import { create } from "zustand";

import { state as metamaskState } from "../services/metamask";
import { balanceOfAll, SupportedTokenMap } from "../services/tokens";

interface AuthState {
  onTargetChain: boolean
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
  onTargetChain: false,
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

metamaskState.subscribe((state, prevState) => {
  const chainId = state.chainId === undefined ? 0 : state.chainId;

  // handle on connect
  if(prevState.accounts === undefined && state.accounts !== undefined) {
    handleOnConnect(state.accounts[0], chainId)

  // handle on disconnect
  } else if(prevState.accounts !== undefined && state.accounts === undefined) {
    handleOnDisconnect(prevState.accounts[0]);

  // handle on account switched
  } else if(
    prevState.accounts !== undefined &&
    state.accounts !== undefined &&
    prevState.accounts[0] !== state.accounts[0]
  ) {
    handleOnAccountSwitch(state.accounts[0], chainId);

  // handle on chainId changed
  } else if(chainId !== 0) {
    useAuth.setState({ onTargetChain: chainId === 137 });
  }
});

// METHODS

// HANDLERS

const handleOnConnect = (address: string, chainId: number) => {
  const onTargetChain = chainId === 137;
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

  useAuth.setState({ onTargetChain, connected, verified, address, username, rank, pfp });
};

const handleOnDisconnect = (address: string) => {
  useAuth.setState({
    onTargetChain: false,
    connected: false,
    verified: false,
    address: null,
    username: null,
    rank: null,
    pfp: null,
  });
};

const handleOnAccountSwitch = (address: string, chainId: number) => {
  console.log('handleOnAccountSwitch');
};
