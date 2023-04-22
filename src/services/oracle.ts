/*
 * ORACLE SERVICE
 *
 * Provides USD denominated price feeds for supported tokens.
 *
 * DON'T export setOracleData
 * DON'T export non const values
 */

import { ethers } from 'ethers';
import { useEffect } from 'react';
import { create } from 'zustand';

import { provider } from './provider';
import { SupportedToken, SupportedTokenMap } from './tokens';

// TYPE DEFINITIONS
type LatestRoundDataResponse = { answer: bigint };
type OracleData = {
  ready: boolean
  priceMap: SupportedTokenMap<number>
};
type OracleMetadata = {
  abi: string[]
  contractAddressMap: SupportedTokenMap<string>
  decimals: number
  hearbeatMs: number
};

// INTERNAL DATA
let serviceIntervalId: number | undefined;
const DEFAULT_PRICE_MAP: SupportedTokenMap<number> = { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 };

const metadata: OracleMetadata = {
  abi: ['function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'],
  contractAddressMap: {
    'USDC' : '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7',
    'MATIC': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
    'WETH' : '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    'WBTC' : '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6',
  },
  decimals: 8,
  hearbeatMs: 27000,
};

const contractMap: SupportedTokenMap<ethers.Contract> = {
  'USDC' : new ethers.Contract(metadata.contractAddressMap.USDC , metadata.abi, provider),
  'MATIC': new ethers.Contract(metadata.contractAddressMap.MATIC, metadata.abi, provider),
  'WETH' : new ethers.Contract(metadata.contractAddressMap.WETH , metadata.abi, provider),
  'WBTC' : new ethers.Contract(metadata.contractAddressMap.WBTC , metadata.abi, provider),
};

// STORE
export const useOracle = create<OracleData>(() => ({
  ready: false,
  priceMap: DEFAULT_PRICE_MAP,
}));

export const getOracleData = useOracle.getState;
const setOracleData = useOracle.setState;

export const oracleReadySelector = (state: OracleData) => state.ready;
export const oraclePriceMapSelector  = (state: OracleData) => state.priceMap;

// METHODS
const updatePrices = async (): Promise<void> => {
  const latestRoundDataPromises: Promise<LatestRoundDataResponse>[] = Object.values(contractMap).map(
    (contract) => contract.latestRoundData()
  );

  const latestRoundData = await Promise.all(latestRoundDataPromises).catch(() => null);
  if(latestRoundData === null) return;

  const latestPrices = latestRoundData.map(
    ({ answer }) => Number(ethers.formatUnits(answer, metadata.decimals))
  );

  const priceMap: SupportedTokenMap<number> = Object.create(DEFAULT_PRICE_MAP);
  Object.keys(contractMap).forEach(
    (token, index) => priceMap[token as SupportedToken] = latestPrices[index]
  );

  setOracleData({ ready: true, priceMap });
};


const startOracleService = (): void => {
  if(serviceIntervalId !== undefined) return;

  updatePrices();
  serviceIntervalId = setInterval(updatePrices, metadata.hearbeatMs);
};

const stopOracleService = (): void => {
  if(serviceIntervalId === undefined) return;

  clearInterval(serviceIntervalId);
  serviceIntervalId = undefined;
};

export const useOracleService = () => {
  useEffect(() => {
    startOracleService();
    return () => stopOracleService();
  })
};
