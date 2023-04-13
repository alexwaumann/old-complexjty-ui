/*
 * ORACLE SERVICE
 *
 * Provides USD denominated price feeds for supported tokens.
 */

import { ethers } from 'ethers';
import { create } from 'zustand';

import { provider } from './provider';

// NOTE: to add new tokens, make changes here
// TODO: this should probably be in a token utility file
type SupportedToken = 'USDC' | 'MATIC' | 'WETH' | 'WBTC';
type SupportedTokenMap<T> = { 'USDC': T, 'MATIC': T, 'WETH': T, 'WBTC': T };

const DEFAULT_PRICES: SupportedTokenMap<number> = { 'USDC': 0, 'MATIC': 0, 'WETH': 0, 'WBTC': 0 };

// SECTION: PUBLIC
export const supportedTokens: SupportedToken[] = ['USDC', 'MATIC', 'WETH', 'WBTC'];

interface OracleDataInterface { prices: SupportedTokenMap<number> };
export const useOracle = create<OracleDataInterface>(() => ({
  prices: DEFAULT_PRICES,
}));

export const oraclePricesSelector = (state: OracleDataInterface) => state.prices;

// SECTION: CHAINLINK ORACLE DATA
const oracleAbi = ['function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'];

type latestRoundDataResponse = { answer: bigint };

const oracleContract: SupportedTokenMap<ethers.Contract> = {
  'USDC' : new ethers.Contract('0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7', oracleAbi, provider),
  'MATIC': new ethers.Contract('0xAB594600376Ec9fD91F8e885dADF0CE036862dE0', oracleAbi, provider),
  'WETH' : new ethers.Contract('0xF9680D99D6C9589e2a93a78A04A279e509205945', oracleAbi, provider),
  'WBTC' : new ethers.Contract('0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6', oracleAbi, provider),
};

const oracleHearbeatMs = 27000;
const oracleDecimals = 8;

// SECTION: PRIVATE
const refreshPrices = async () => {
  const promises: Promise<latestRoundDataResponse>[] = Object.values(oracleContract).map(
    (contract) => contract.latestRoundData()
  );

  const latestRoundData = await Promise.all(promises).catch(() => null);
  if(latestRoundData === null) return;

  const latestPrices = latestRoundData.map(
    (roundData) => Number(ethers.formatUnits(roundData.answer, oracleDecimals))
  );

  const prices: SupportedTokenMap<number> = Object.create(DEFAULT_PRICES);
  Object.keys(oracleContract).forEach(
    (token, index) => prices[token as SupportedToken] = latestPrices[index]
  );

  useOracle.setState({ prices });
};

// SECTION: START SERVICE
refreshPrices();
setInterval(refreshPrices, oracleHearbeatMs);
