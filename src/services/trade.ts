/*
 * TRADE SERVICE
 *
 * todo: debounce for inputs that could reasonably change a lot in very short periods of time
 * 
 * NOTE: only this service should be able to modify it's own state
 */

import { create } from "zustand";
import { SupportedPair } from "../utils/pairs";
import { SupportedToken } from "./tokens";

type TradeType = 'LONG' | 'SHORT';
type TradeInput = {
  type: TradeType
  pairName: SupportedPair
  fundingAmount: number
  fundingToken: SupportedToken
  leverageMultiplier: number
};
type TradeData = {
  inputs: TradeInput
};

export const LONG : TradeType = 'LONG';
export const SHORT: TradeType = 'SHORT';

const defaultTradeInputs: TradeInput = {
  type: LONG,
  pairName: 'WETH/USDC',
  fundingAmount: 0,
  fundingToken: 'USDC',
  leverageMultiplier: 2,
};

export const useTrade = create<TradeData>(() => ({
  inputs: defaultTradeInputs,
}));

class Trade {
  public get state(): TradeData { return useTrade.getState() }
  private set state(newState: Parameters<typeof useTrade.setState>[0]) { useTrade.setState(newState) }

  private recalculate(): void {
  };

  public updateInputs(inputs: Partial<TradeInput>) {
    // validate input
    if(inputs.fundingAmount !== undefined && inputs.fundingAmount < 0) return;
    if(inputs.leverageMultiplier !== undefined && inputs.leverageMultiplier < 0) return;

    this.state = (state) => ({ inputs: { ...state.inputs, ...inputs } });
    this.recalculate();
  };
}
