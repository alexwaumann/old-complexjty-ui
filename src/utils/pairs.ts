import { SupportedToken, Token, TOKEN } from "../services/tokens";

export type SupportedPair = "WETH/USDC" | "WBTC/USDC" | "WETH/WBTC" | "MATIC/USDC" | "MATIC/WETH" | "MATIC/WBTC";

export const PAIRS: SupportedPair[] = [
  "WETH/USDC",
  "WBTC/USDC",
  "WETH/WBTC",
  "MATIC/USDC",
  "MATIC/WETH",
  "MATIC/WBTC",
];

export const PAIR: Record<SupportedPair, Token[]> = {
  "WETH/USDC" : [TOKEN['WETH'] , TOKEN['USDC']],
  "WBTC/USDC" : [TOKEN['WBTC'] , TOKEN['USDC']],
  "WETH/WBTC" : [TOKEN['WETH'] , TOKEN['WBTC']],
  "MATIC/USDC": [TOKEN['MATIC'], TOKEN['USDC']],
  "MATIC/WETH": [TOKEN['MATIC'], TOKEN['WETH']],
  "MATIC/WBTC": [TOKEN['MATIC'], TOKEN['WBTC']],
};
