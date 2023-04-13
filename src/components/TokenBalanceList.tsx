import { Avatar, Stack, Typography } from "@mui/material";

import useAuth from '../hooks/useAuth';
import { oraclePricesSelector, useOracle } from '../services/oracle';
import { tokens } from "../services/tokens";

const TokenBalanceList = () => {
  const oracle = useOracle(oraclePricesSelector);
  const balances = useAuth((state) => state.balances);

  // TODO: create token component that takes in a symbol and size
  return (
    <Stack spacing={2}>
      {tokens.map((symbol) => {
        const amount = balances[symbol];
        const usdValue = amount * oracle[symbol];
        if(usdValue < 10) return;
        return (
          <Stack key={symbol} direction="row" alignItems="center" spacing={2}>
            <Avatar src={`token-images/${symbol.toLowerCase()}.png`} sx={{ height: 20, width: 20 }} />
            <Typography variant="body2" fontWeight={500} flexGrow={1}>
              {amount}
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              ${usdValue.toFixed(2)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default TokenBalanceList;
