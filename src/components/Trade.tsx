import { TrendingDownRounded, TrendingUpRounded} from "@mui/icons-material";
import { Box, Button, Grid, InputAdornment, MenuItem, Paper, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";

import useAuth from "../hooks/useAuth";
import { oraclePricesSelector, useOracle } from "../services/oracle";
import { SupportedToken, TOKEN, TOKENS } from "../services/tokens";
import { formatTokenAmount, formatUsdPrice } from "../utils/format";
import { PAIRS, PAIR, SupportedPair } from "../utils/pairs";

type TradeType = 'LONG' | 'SHORT';
const LONG = 'LONG';
const SHORT = 'SHORT';

const Trade = () => {
  const oracle = useOracle(oraclePricesSelector);
  const balances = useAuth((state) => state.balances);

  const [pairName, setPairName] = useState<SupportedPair>('WETH/USDC');
  const [tradeType, setTradeType] = useState<TradeType>(LONG);

  const [fundingToken, setFundingToken] = useState<SupportedToken>('USDC');
  const [fundingAmount, setFundingAmount] = useState<string>('');
  const fundingError: boolean = Number(fundingAmount) > balances[fundingToken];

  const [leverage, setLeverage] = useState<number>(2);

  const pair = PAIR[pairName];
  const price = oracle[pair[0].name] / oracle[pair[1].name];

  const debtToken       = tradeType === LONG ? pair[1] : pair[0];
  const collateralToken = tradeType === LONG ? pair[0] : pair[1];

  return (
    <Grid container spacing={2}>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={4}>
            <Select
              value={pairName}
              onChange={(event) => setPairName(event.target.value as SupportedPair)}
              color="primary"
            >
              {PAIRS.map((pairName) => <MenuItem key={pairName} value={pairName}>{pairName}</MenuItem>)}
            </Select>
            <Typography fontWeight={700}>{formatTokenAmount(pair[1].name, price)}</Typography>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ height: 300, p: 2, borderRadius: 2 }}>
          <Stack justifyContent="space-between" height="100%">
            <ToggleButtonGroup
              value={tradeType}
              onChange={(event, value: TradeType | null) => { if(value !== null) setTradeType(value) }}
              exclusive
              color="primary"
              fullWidth
            >
              <ToggleButton value={LONG}>
                <TrendingUpRounded />
                <Box m={1} />
                <Typography>LONG</Typography>
              </ToggleButton>
              <ToggleButton value={SHORT}>
                <TrendingDownRounded />
                <Box m={1} />
                <Typography>SHORT</Typography>
              </ToggleButton>
            </ToggleButtonGroup>

            <Box m={1} />

            <TextField
              label={`Pay: $${formatUsdPrice(Number(fundingAmount) * oracle[fundingToken])}`}
              value={fundingAmount ? fundingAmount : ''}
              InputLabelProps={{ shrink: true }}
              placeholder={'0.00'}
              helperText={`Balance: ${balances[fundingToken]}`}
              error={fundingError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={() => setFundingAmount(balances[fundingToken].toString())}>MAX</Button>
                    <Select
                      variant="standard"
                      value={fundingToken}
                      onChange={(event) => {
                        setFundingToken(event.target.value as SupportedToken)
                        setFundingAmount('');
                      }}
                      color="primary"
                      disableUnderline
                    >
                      {TOKENS.map((tokenName) => <MenuItem key={tokenName} value={tokenName}>{tokenName}</MenuItem>)}
                    </Select>
                  </InputAdornment>
                )
              }}
              onChange={(event) => {
                const amount = event.target.value;
                if(isNaN(Number(amount))) return;

                setFundingAmount(amount);
              }}
              fullWidth
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Leverage</Typography>
              <Typography>{leverage}x</Typography>
            </Stack>

            <Slider
              aria-label="Leverage Multiplier"
              value={leverage}
              step={0.1}
              min={1.5}
              max={TOKEN[fundingToken].maxLeverage}
              valueLabelDisplay="auto"
              size="small"
              onChange={(event: Event, value: number | number[]) => { if(typeof value === 'number') setLeverage(value) }}
            />
            <Button variant="outlined" disabled={!fundingAmount || fundingError}>Open position</Button>
          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ height: 300, p: 2, borderRadius: 2 }}>
          <Stack spacing={2}>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={700}>Funding</Typography>
              <Stack alignItems="flex-end">
                <Typography variant="caption" fontWeight={700}>{formatTokenAmount(fundingToken, Number(fundingAmount))} {fundingToken}</Typography>
                <Typography variant="caption">${formatUsdPrice(Number(fundingAmount) * oracle[fundingToken])}</Typography>
              </Stack>
            </Stack>

          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Trade;
