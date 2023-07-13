/*
 * TRADE SERVICE
 *
 * todo: debounce for inputs that could reasonably change a lot in very short periods of time
 * 
 * NOTE: only this service should be able to modify it's own state
 */

import { create } from "zustand";

import { oracle } from './oracle';
import { PAIR, SupportedPair } from "../utils/pairs";
import { SupportedToken } from "./tokens";

export type TradeDirection = 'LONG' | 'SHORT';
export type TradeType = 'MARKET' | 'LIMIT';
type TradeInput = {
  type: TradeType
  direction: TradeDirection
  pairName: SupportedPair
  fundingAmount: string
  fundingToken: SupportedToken
  leverageMultiplier: number
  limitPrice: string
  stopLossPrice: string
  takeProfitPrice: string
};
type TradeDetails = {
  type: TradeType
  direction: TradeDirection
  openPrice: number
  fundingAmount: number
  fundingToken: SupportedToken
  collateralAmount: number
  collateralToken: SupportedToken
  debtAmount: number
  debtToken: SupportedToken
  leverageMultiplier: number
  limitPrice: number
  stopLossPrice: number
  takeProfitPrice: number
  zapFeeUsd: number
  swapFeeUsd: number
  flashloanFeeUsd: number
};
type TradeServiceState = {
  inputs: TradeInput
  details: TradeDetails | null
};

export const LONG : TradeDirection = 'LONG';
export const SHORT: TradeDirection = 'SHORT';
export const MARKET : TradeType = 'MARKET';
export const LIMIT: TradeType = 'LIMIT';

const defaultTradeInputs: TradeInput = {
  type: MARKET,
  direction: LONG,
  pairName: 'WETH/USDC',
  fundingAmount: '',
  fundingToken: 'USDC',
  leverageMultiplier: 2,
  limitPrice: '',
  stopLossPrice: '',
  takeProfitPrice: '',
};

export const useTradeServiceStore = create<TradeServiceState>(() => ({
  inputs: defaultTradeInputs,
  details: null,
}));

class TradeService {
  public selectors = {
    inputs: (state: TradeServiceState) => state.inputs,
  };

  public get state(): TradeServiceState { return useTradeServiceStore.getState() }
  private set state(newState: Parameters<typeof useTradeServiceStore.setState>[0]) { useTradeServiceStore.setState(newState) }

  private calculate(): void {
    const inputs = this.state.inputs;
    const usdPrices = oracle.state.usdPrices;

    const pair = PAIR[inputs.pairName];
    const debtToken = inputs.direction === LONG ? pair[1] : pair[0];
    const collateralToken = inputs.direction === LONG ? pair[0] : pair[1];

    const fundingPriceUsd = usdPrices[inputs.fundingToken];
    const collateralPriceUsd = usdPrices[collateralToken.name];
    const debtPriceUsd = usdPrices[debtToken.name];

    const fundingAmount = Number(inputs.fundingAmount);
    const limitPrice = Number(inputs.limitPrice);
    const stopLossPrice = Number(inputs.stopLossPrice);
    const takeProfitPrice = Number(inputs.takeProfitPrice);

    // TODO: these rates should be estimated with uniswap
    const zapFeeRate = 0.003;
    const swapFeeRate = 0.0005;
    const flashloanFeeRate = 0.0009;

    // exit early if no funding amount or limit price on limit order
    if(fundingAmount <= 0 || (inputs.type === LIMIT && limitPrice <= 0)) return;

    let openPrice = usdPrices[pair[0].name] / usdPrices[pair[1].name];
    if(inputs.type === LIMIT) openPrice = limitPrice;

    const f2cRate = fundingPriceUsd / collateralPriceUsd;
    const d2cRate = debtPriceUsd / collateralPriceUsd;

    let collateralAmount = 0;
    let debtAmount = 0;
    let zapFeeUsd = 0;
    let swapFeeUsd = 0;
    let flashloanFeeUsd = 0;

    const targetCollateralAmount = fundingAmount * f2cRate * inputs.leverageMultiplier;
    if(inputs.fundingToken !== collateralToken.name) {
      zapFeeUsd = fundingAmount * zapFeeRate * fundingPriceUsd;
      collateralAmount = fundingAmount * f2cRate * (1 - zapFeeRate);
    } else {
      collateralAmount = fundingAmount;
    }

    const targetFlashloanOutput = targetCollateralAmount - collateralAmount;
    const flashloanAmount = targetFlashloanOutput / (d2cRate * (1 - swapFeeRate));
    const flashloanFee = flashloanAmount * flashloanFeeRate;

    swapFeeUsd = flashloanAmount * swapFeeRate * debtPriceUsd;
    flashloanFeeUsd = flashloanFee * debtPriceUsd;
    debtAmount = flashloanAmount + flashloanFee;
    collateralAmount += targetFlashloanOutput;

    this.state = {
      details: {
        type: inputs.type,
        direction: inputs.direction,
        openPrice,
        fundingAmount,
        fundingToken: inputs.fundingToken,
        collateralAmount,
        collateralToken: collateralToken.name,
        debtAmount,
        debtToken: debtToken.name,
        leverageMultiplier: 0,
        limitPrice,
        stopLossPrice,
        takeProfitPrice,
        zapFeeUsd,
        swapFeeUsd,
        flashloanFeeUsd,
      }
    };
  };

  public updateInputs(inputs: Partial<TradeInput>) {
    // validate input
    if(inputs.fundingAmount !== undefined && Number(inputs.fundingAmount) < 0) return;
    if(inputs.leverageMultiplier !== undefined && inputs.leverageMultiplier < 0) return;

    this.state = (state) => ({ inputs: { ...state.inputs, ...inputs } });
    this.calculate();
  };
}

export const tradeService = new TradeService();

// TODO: subscribe to oracle and recalculate on pair price change
