import { SupportedToken } from "../services/tokens";

export const formatTokenAmount = (token: SupportedToken, amount: number): string => {
  let formattedAmount = amount.toString();
  if(token === 'USDC' || token === 'MATIC') {
    formattedAmount = amount.toFixed(2);
  } else if(token === 'WETH') {
    formattedAmount = amount.toFixed(5);
  } else if(token === 'WBTC') {
    formattedAmount = amount.toFixed(6);
  }

  return formattedAmount;
};

export const formatUsdPrice = (price: number): string => {
  if(price / 1000000 > 1) {
    return `${(price / 1000000).toFixed(2)}M`;
  } else if(price / 1000 > 1) {
    return `${(price / 1000).toFixed(2)}K`;
  }
  return price.toFixed(2);
};
