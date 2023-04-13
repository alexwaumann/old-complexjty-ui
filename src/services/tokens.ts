import { ethers } from 'ethers';

import { provider } from './provider';

interface Token {
  name: string
  decimals: number
  address: string
  isNative: boolean

  liquidationThreshold: number
  maxLeverage: number
  logoUrl: string
};

// SECTION: PUBLIC
export type SupportedToken = 'USDC' | 'MATIC' | 'WETH' | 'WBTC';
export type SupportedTokenMap<T> = { 'USDC': T, 'MATIC': T, 'WETH': T, 'WBTC': T };

export const tokens: SupportedToken[] = ['USDC', 'MATIC', 'WETH', 'WBTC'];
export const token: SupportedTokenMap<Token> = {
  'USDC' : {
    name: '', decimals: 6, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', isNative: false,
    liquidationThreshold: 0.85, maxLeverage: 5, logoUrl: '/token-images/usdc.png',
  },
  'MATIC' : {
    name: '', decimals: 18, address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', isNative: true,
    liquidationThreshold: 0.7, maxLeverage: 2.5, logoUrl: '/token-images/matic.png',
  },
  'WETH' : {
    name: '', decimals: 18, address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', isNative: false,
    liquidationThreshold: 0.825, maxLeverage: 4.5, logoUrl: '/token-images/weth.png',
  },
  'WBTC' : {
    name: '', decimals: 8, address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', isNative: false,
    liquidationThreshold: 0.75, maxLeverage: 3, logoUrl: '/token-images/wbtc.png',
  },
};

export const balanceOfAll = async (address: string): Promise<SupportedTokenMap<number> | null> => {
  const promises: Promise<bigint>[] = tokens.map((tokenName) => {
    if(token[tokenName].isNative) return provider.getBalance(address);
    return tokenContract[tokenName].balanceOf(address);
  });
  const balances = await Promise.all(promises).catch(() => null);

  if(balances === null) return null;

  return {
    'USDC' : Number(ethers.formatUnits(balances[0], token.USDC.decimals)),
    'MATIC': Number(ethers.formatUnits(balances[1], token.MATIC.decimals)),
    'WETH' : Number(ethers.formatUnits(balances[2], token.WETH.decimals)),
    'WBTC' : Number(ethers.formatUnits(balances[3], token.WBTC.decimals)),
  };
};

// SECTION: PRIVATE
const erc20Abi = [
  'function balanceOf(address account) view returns (uint256)',
];

const tokenContract: SupportedTokenMap<ethers.Contract> = {
  'USDC' : new ethers.Contract(token['USDC'] .address, erc20Abi, provider),
  'MATIC': new ethers.Contract(token['MATIC'].address, erc20Abi, provider),
  'WETH' : new ethers.Contract(token['WETH'] .address, erc20Abi, provider),
  'WBTC' : new ethers.Contract(token['WBTC'] .address, erc20Abi, provider),
};
