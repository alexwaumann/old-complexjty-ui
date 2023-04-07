import { create } from "zustand";

import { metamask, state as metamaskState } from "../connectors/metamask";
import { CHAINID } from "../connectors/network";

const RPCURL = import.meta.env.DEV ? 'http://localhost:8545' : 'https://polygon-rpc.com';

interface AuthState {
  onTargetChain: boolean
  connected: boolean
  verified: boolean

  address: string | null
  username: string | null
  rank: string | null

  pfp: { url: string, rarity: string, attributes: string[] } | null
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
    useAuth.setState({ onTargetChain: chainId === CHAINID });
  }
});

// METHODS

export const connectWallet = () => metamask.activate({
  chainName: 'Polygon Mainnet',
  chainId: 137,
  rpcUrls: [RPCURL],
  blockExplorerUrls: ['https://polygonscan.com'],
  nativeCurrency: {
    name: 'Matic',
    symbol: 'MATIC',
    decimals: 18,
  },
});

export const connectWalletEagerly = () => {
  // TODO: skip eager connect if user disconnected on last session
  metamask.connectEagerly();
}

export const disconnectWallet = () => metamask.resetState();


// HANDLERS

const handleOnConnect = (address: string, chainId: number) => {
  const onTargetChain = chainId === CHAINID;
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
