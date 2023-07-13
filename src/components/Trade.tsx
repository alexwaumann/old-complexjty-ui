import { TrendingDownRounded, TrendingUpRounded} from "@mui/icons-material";
import { Box, Button, Grid, InputAdornment, MenuItem, Paper, Select, Slider, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";

import { oracle, useOracle } from "../services/oracle";
import { SupportedToken, TOKEN, TOKENS } from "../services/tokens";
import { LONG, SHORT, TradeDirection, tradeService, TradeType, useTradeServiceStore } from "../services/trade";
import { user, useUser } from "../services/user";
import { formatTokenAmount, formatUsdPrice } from "../utils/format";
import { PAIRS, PAIR, SupportedPair } from "../utils/pairs";

const Trade = () => {
  const oracleUsdPrices = useOracle(oracle.selectors.usdPrices);
  const balances = useUser(user.selectors.balances);
  const inputs = useTradeServiceStore(tradeService.selectors.inputs);

  const [fundingToken, setFundingToken] = useState<SupportedToken>('USDC');
  const [fundingAmount, setFundingAmount] = useState<string>('');
  const fundingError: boolean = Number(fundingAmount) > balances[fundingToken];

  const pair = PAIR[inputs.pairName];
  const price = oracleUsdPrices[pair[0].name] / oracleUsdPrices[pair[1].name];

  const debtToken       = inputs.direction === LONG ? pair[1] : pair[0];
  const collateralToken = inputs.direction === LONG ? pair[0] : pair[1];

  const fundingAmountUsd = formatUsdPrice(Number(inputs.fundingAmount) * oracleUsdPrices[inputs.fundingToken]);

  return (
    <Grid container spacing={2}>

      <Grid item xs={12}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={4}>
            <Select
              value={inputs.pairName}
              onChange={(event) => tradeService.updateInputs({ pairName: event.target.value as SupportedPair })}
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
              value={inputs.direction}
              onChange={(_, value: TradeDirection | null) => {if(value !== null) tradeService.updateInputs({ direction: value })}}
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
              label={`Pay: $${fundingAmountUsd}`}
              value={fundingAmount}
              InputLabelProps={{ shrink: true }}
              placeholder={'0.00'}
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
                tradeService.updateInputs({ fundingAmount: amount });
              }}
              fullWidth
            />

            <Typography variant="caption">Balance: {balances[fundingToken]}</Typography>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography>Leverage</Typography>
              <Typography>{inputs.leverageMultiplier}x</Typography>
            </Stack>

            <Slider
              aria-label="Leverage Multiplier"
              value={inputs.leverageMultiplier}
              step={0.1}
              min={1.5}
              max={TOKEN[fundingToken].maxLeverage}
              valueLabelDisplay="auto"
              size="small"
              onChange={(_, value: number | number[]) => {
                if(typeof value === 'number') tradeService.updateInputs({ leverageMultiplier: value });
              }}
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
                <Typography variant="caption">${formatUsdPrice(Number(fundingAmount) * oracleUsdPrices[fundingToken])}</Typography>
              </Stack>
            </Stack>

          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Trade;
