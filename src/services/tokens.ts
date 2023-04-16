import { ethers } from 'ethers';

import { provider } from './provider';

// SECTION: PUBLIC
export type SupportedToken = 'USDC' | 'MATIC' | 'WETH' | 'WBTC';
export type SupportedTokenMap<T> = Record<SupportedToken, T>;

export type Token = {
  name: SupportedToken
  decimals: number
  address: string
  isNative: boolean

  liquidationThreshold: number
  maxLeverage: number
  logoUrl: string
};

export const USDC: Token = {
  name: 'USDC', decimals: 6, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', isNative: false,
  liquidationThreshold: 0.85, maxLeverage: 5, logoUrl: '/token-images/usdc.png',
};

export const MATIC: Token = {
  name: 'MATIC', decimals: 18, address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', isNative: true,
  liquidationThreshold: 0.7, maxLeverage: 2.5, logoUrl: '/token-images/matic.png',
};

export const WETH: Token = {
  name: 'WETH', decimals: 18, address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', isNative: false,
  liquidationThreshold: 0.825, maxLeverage: 4.5, logoUrl: '/token-images/weth.png',
};

export const WBTC: Token = {
  name: 'WBTC', decimals: 8, address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', isNative: false,
  liquidationThreshold: 0.75, maxLeverage: 3, logoUrl: '/token-images/wbtc.png',
};

export const TOKENS: SupportedToken[] = ['USDC', 'MATIC', 'WETH', 'WBTC'];
export const TOKEN: SupportedTokenMap<Token> = {
  'USDC' : USDC,
  'MATIC': MATIC,
  'WETH' : WETH,
  'WBTC' : WBTC,
};

export const balanceOfAll = async (address: string): Promise<SupportedTokenMap<number> | null> => {
  const promises: Promise<bigint>[] = TOKENS.map((tokenName) => {
    if(TOKEN[tokenName].isNative) return provider.getBalance(address);
    return tokenContract[tokenName].balanceOf(address);
  });
  const balances = await Promise.all(promises).catch(() => null);

  if(balances === null) return null;

  return {
    'USDC' : Number(ethers.formatUnits(balances[0], TOKEN.USDC.decimals)),
    'MATIC': Number(ethers.formatUnits(balances[1], TOKEN.MATIC.decimals)),
    'WETH' : Number(ethers.formatUnits(balances[2], TOKEN.WETH.decimals)),
    'WBTC' : Number(ethers.formatUnits(balances[3], TOKEN.WBTC.decimals)),
  };
};

// SECTION: PRIVATE
const erc20Abi = [
  'function balanceOf(address account) view returns (uint256)',
];

const tokenContract: SupportedTokenMap<ethers.Contract> = {
  'USDC' : new ethers.Contract(TOKEN['USDC'] .address, erc20Abi, provider),
  'MATIC': new ethers.Contract(TOKEN['MATIC'].address, erc20Abi, provider),
  'WETH' : new ethers.Contract(TOKEN['WETH'] .address, erc20Abi, provider),
  'WBTC' : new ethers.Contract(TOKEN['WBTC'] .address, erc20Abi, provider),
};
