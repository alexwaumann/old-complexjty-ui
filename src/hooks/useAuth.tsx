import { create } from "zustand";

import { metamask, state as metamaskState } from "../connectors/metamask";
import { CHAINID } from "../connectors/network";

interface AuthState {
  onTargetChain: boolean
  connected: boolean
  verified: boolean

  address: string | null
  username: string | null
  avatarUrl: string | null
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
  avatarUrl: null,
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
  rpcUrls: ['https://polygon-rpc.com'],
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

  // TODO: get avatar from registry (may not have one)
  const avatarUrl = '/placeholder-pfp.webp';

  useAuth.setState({ onTargetChain, connected, verified, address, username, avatarUrl });
};

const handleOnDisconnect = (address: string) => {
  useAuth.setState({
    onTargetChain: false,
    connected: false,
    verified: false,
    address: null,
    username: null,
    avatarUrl: null,
  });
};

const handleOnAccountSwitch = (address: string, chainId: number) => {
  console.log('handleOnAccountSwitch');
};
