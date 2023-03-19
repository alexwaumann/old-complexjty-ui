import { initializeConnector } from '@web3-react/core';
import { Network } from '@web3-react/network';

export const CHAINID = 137;

const networkMapping = {
  [CHAINID]: [
    'https://polygon-mainnet.g.alchemy.com/v2/6YUtaEGT8dEkgjyUSZv8D9hwRHJ2CSDX',
    'https://polygon.llamarpc.com',
  ]
};

export const [network, hooks, state] = initializeConnector<Network>(
  (actions) => new Network({ actions, urlMap: networkMapping })
);

export const {
  useIsActivating,
  useIsActive,
  useProvider,
} = hooks;

export const connectNetwork = async () => {
  await network.activate(CHAINID);

  setInterval(async () => {
    const networkStatus = await network.customProvider
      ?.getNetwork()
      .catch((error) => console.log(`Health Check Failed: ${error.event}`))

    state.setState({ chainId: networkStatus?.chainId });
  }, 5000);
};
