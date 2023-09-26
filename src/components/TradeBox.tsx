import { ExpandMore } from "@mui/icons-material";
import { Avatar, Badge, Button, Grid, InputAdornment, MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";

import { oracle, useOracle } from "../services/oracle";
import { SupportedToken, TOKEN, TOKENS } from "../services/tokens";
import { user, useUser } from "../services/user";
import { formatTokenAmount, formatUsdPrice } from "../utils/format";
import { PAIR, PAIRS, SupportedPair } from "../utils/pairs";

type TradeType = 'LONG' | 'SHORT';
type TradeEntry = 'MARKET' | 'LIMIT';

const TradeBox = () => {
  const oracleUsdPrices = useOracle(oracle.selectors.usdPrices);
  const balances = useUser(user.selectors.balances);

  const [pairName, setPairName] = useState<SupportedPair>('WETH/USDC');
  const [tradeType, setTradeType] = useState<TradeType>('LONG');
  const [tradeEntry, setTradeEntry] = useState<TradeEntry>('MARKET');

  const [limitPrice, setLimitPrice] = useState<string>('');
  const [fundingToken, setFundingToken] = useState<SupportedToken>('USDC');
  const [fundingAmount, setFundingAmount] = useState<string>('');
  const fundingError: boolean = Number(fundingAmount) > balances[fundingToken];

  const estimate = null;

  const pair = PAIR[pairName];
  const price = oracleUsdPrices[pair[0].name] / oracleUsdPrices[pair[1].name];

  return (
    <Grid container spacing={2}>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p:2, borderRadius: 2 }}>
          <Stack direction="column" spacing={2}>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Select
                IconComponent={ExpandMore}
                value={pairName}
                onChange={(event) => setPairName(event.target.value as SupportedPair)}
                size="medium"
                fullWidth
              >
                {PAIRS.map((pairName) => (
                  <MenuItem key={pairName} value={pairName}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                        badgeContent={
                          <Avatar
                            variant="circular"
                            src={`token-images/${PAIR[pairName][1].name.toLowerCase()}.png`}
                            sx={{ height: 16, width: 16 }}
                          />
                        }
                      >
                        <Avatar
                          variant="rounded"
                          src={`token-images/${PAIR[pairName][0].name.toLowerCase()}.png`}
                          sx={{ height: 24, width: 24 }}
                        />
                      </Badge>
                      <Typography variant="button">{pairName}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              <ToggleButtonGroup
                value={tradeType}
                onChange={(_, value: TradeType | null) => { if(value !== null) setTradeType(value) }}
                exclusive
                color="primary"
                size="large"
                fullWidth
              >
                <ToggleButton value="LONG">LONG</ToggleButton>
                <ToggleButton value="SHORT">SHORT</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2}>
              <ToggleButtonGroup
                value={tradeEntry}
                onChange={(_, value: TradeEntry | null) => {
                  if(value !== null) setTradeEntry(value);
                  if(value === 'LIMIT') setLimitPrice(price.toFixed(0));
                }}
                exclusive
                color="primary"
                size="large"
                fullWidth
              >
                <ToggleButton value="MARKET">MARKET</ToggleButton>
                <ToggleButton value="LIMIT">LIMIT</ToggleButton>
              </ToggleButtonGroup>
              {tradeEntry === 'MARKET' ? (
                <TextField
                  label="Entry Price"
                  value={formatTokenAmount(pair[1].name, price)}
                  disabled
                  fullWidth
                />
              ) : (
                <TextField
                  label="Entry Price"
                  value={limitPrice}
                  onChange={(event) => {
                    const amount = event.target.value;
                    if(isNaN(Number(amount))) return;

                    setLimitPrice(amount);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography>{`${((Number(limitPrice) - price) / price * 100).toFixed(2)} %`}</Typography>
                      </InputAdornment>
                    )
                  }}
                  helperText={`Current Price: ${formatTokenAmount(pair[1].name, price)}`}
                  fullWidth
                />
              )}
            </Stack>

            <TextField
              label={`Pay: $${formatUsdPrice(Number(fundingAmount) * oracleUsdPrices[fundingToken])}`}
              value={fundingAmount ? fundingAmount : ''}
              InputLabelProps={{ shrink: true }}
              placeholder={'0.00'}
              helperText={`Balance: ${balances[fundingToken]}`}
              error={fundingError}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button size="small" onClick={() => setFundingAmount(balances[fundingToken].toString())}>MAX</Button>
                    <Select
                      IconComponent={ExpandMore}
                      variant="standard"
                      value={fundingToken}
                      onChange={(event) => {
                        setFundingToken(event.target.value as SupportedToken)
                        setFundingAmount('');
                      }}
                      color="primary"
                      disableUnderline
                    >
                      {TOKENS.map((tokenName) => (
                        <MenuItem key={tokenName} value={tokenName}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              variant="rounded"
                              src={`token-images/${TOKEN[tokenName].name.toLowerCase()}.png`}
                              sx={{ height: 22, width: 22 }}
                            />
                            <Typography variant="button">{tokenName}</Typography>
                          </Stack>
                        </MenuItem>)
                      )}
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

            <Stack direction="row" spacing={2}>
              <Button variant="outlined" fullWidth>add stop loss</Button>
              <Button variant="outlined" fullWidth>add take profit</Button>
            </Stack>

          </Stack>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p:2, borderRadius: 2 }}>
          {estimate ? (
            <div></div>
          ) : (
            <div>no trade estimate</div>
          )
          }
        </Paper>
      </Grid>

    </Grid>
  );
};

export default TradeBox;
