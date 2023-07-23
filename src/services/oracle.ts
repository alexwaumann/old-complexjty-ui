/*
 * ORACLE SERVICE
 *
 * Provides USD denominated price feeds for supported tokens.
 *
 * Use the useOracleService hook to start/stop service in top level component.
 * Use the useOracle hook to access reactive data in components
 * Use the oracle instance to access live data
 */

import { ethers } from 'ethers';
import { useEffect } from 'react';
import { create } from 'zustand';

import { provider } from './provider';
import { SupportedToken, SupportedTokenMap } from './tokens';

type LatestRoundDataResponse = { answer: bigint };
type OracleData = { ready: boolean, usdPrices: SupportedTokenMap<number> };

const ABI: string[] = ['function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'];
const CONTRACT_ADDRESSES: SupportedTokenMap<string> = {
  'USDC' : '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
  'MATIC': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
  'WETH' : '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  'WBTC' : '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6',
};
const DECIMALS: number = 8;
const HEARTBEAT_MS: number = 27000;
const CONTRACTS: SupportedTokenMap<ethers.Contract> = {
      'USDC' : new ethers.Contract(CONTRACT_ADDRESSES.USDC , ABI, provider),
      'MATIC': new ethers.Contract(CONTRACT_ADDRESSES.MATIC, ABI, provider),
      'WETH' : new ethers.Contract(CONTRACT_ADDRESSES.WETH , ABI, provider),
      'WBTC' : new ethers.Contract(CONTRACT_ADDRESSES.WBTC , ABI, provider),
};
const DEFAULT_PRICE_MAP: SupportedTokenMap<number> = { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 };

export const useOracle = create<OracleData>(() => ({
  ready: false,
  usdPrices: DEFAULT_PRICE_MAP,
}));

export const useOracleService = () => {
  useEffect(() => {
    oracle.start();
    return () => oracle.stop();
  })
};

export class Oracle {
  private serviceId: number | undefined;

  public selectors = {
    ready: (state: OracleData) => state.ready,
    usdPrices: (state: OracleData) => state.usdPrices,
  };

  public get state(): OracleData { return useOracle.getState() }
  private set state(newState: Parameters<typeof useOracle.setState>[0]) { useOracle.setState(newState) }
  public subscribe = useOracle.subscribe;

  public start(): void {
    if(this.serviceId !== undefined) return;

    this.update();
    this.serviceId = setInterval(() => this.update(), HEARTBEAT_MS);
  }

  public stop(): void {
    if(this.serviceId === undefined) return;

    clearInterval(this.serviceId);
    this.serviceId = undefined;
  }

  private async update():  Promise<void> {
    const latestRoundDataPromises: Promise<LatestRoundDataResponse>[] = Object.values(CONTRACTS).map(
      (contract) => contract.latestRoundData()
    );

    const latestRoundData = await Promise.all(latestRoundDataPromises).catch(() => null);
    if(latestRoundData === null) {
      console.warn('COMPLEXJTY: FAILED TO UPDATE ORACLE USD PRICES');
      return;
    };

    const latestPrices = latestRoundData.map(
      ({ answer }) => Number(ethers.formatUnits(answer, DECIMALS))
    );

    let shouldUpdateState = false;
    const priceMap: SupportedTokenMap<number> = Object.create(DEFAULT_PRICE_MAP);
    Object.keys(CONTRACTS).forEach((token, index) => {
      priceMap[token as SupportedToken] = latestPrices[index]
      if(this.state.usdPrices[token as SupportedToken] !== latestPrices[index]) {
        shouldUpdateState = true;
      }
    });

    if(!shouldUpdateState) return;

    this.state = { ready: true, usdPrices: priceMap };
  }
};

export const oracle = new Oracle();
