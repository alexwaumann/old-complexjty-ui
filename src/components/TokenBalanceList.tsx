import { Avatar, Box, Stack, Typography } from "@mui/material";

import { oraclePriceMapSelector, useOracle } from '../services/oracle';
import { TOKENS } from "../services/tokens";
import { useUser } from "../services/user";
import { formatTokenAmount, formatUsdPrice } from "../utils/format";

const TokenBalanceList = () => {
  const oracle = useOracle(oraclePriceMapSelector);
  const balances = useUser((state) => state.balances);

  // TODO: create token component that takes in a symbol and size
  return (
    <Stack flexGrow={1} spacing={2}>
      {TOKENS.map((symbol) => {
        const amount = balances[symbol];
        const usdValue = amount * oracle[symbol];
        if(usdValue < 10) return;
        return (
          <Stack key={symbol} direction="row" alignItems="center" spacing={2}>
            <Avatar src={`token-images/${symbol.toLowerCase()}.png`} sx={{ height: 24, width: 24 }} />
            <Typography variant="body2" fontWeight={700}>
              {formatTokenAmount(symbol, amount)}
            </Typography>
            <Box flexGrow={1} />
            <Typography variant="caption" fontWeight={700}>
              ${formatUsdPrice(usdValue)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default TokenBalanceList;
