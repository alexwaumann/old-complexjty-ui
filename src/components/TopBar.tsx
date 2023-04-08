import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Stack,
  Toolbar,
} from "@mui/material";

import AccountBox from "./AccountBox";
import {
  useIsActive,
  useIsActivating,
} from "../connectors/network";
import useAuth, { connectWallet } from "../hooks/useAuth";

const toolbarHeight = 80;
const toolbarPaddingY = 1;
const toolbarItemHeight = toolbarHeight - toolbarPaddingY * 2 * 8;

const TopBar = () => {
  const connected = useIsActive();
  const connecting = useIsActivating();
  const walletConnected = useAuth((auth) => auth.connected);

  return(
    <AppBar position="absolute" elevation={0} sx={{ background: '#12121299' }}>
      <Toolbar sx={{ height: toolbarHeight, py: toolbarPaddingY }}>
        <Avatar 
          variant="rounded"
          src="/logo.png"
          sx={{ height: toolbarItemHeight, width: toolbarItemHeight }}
        />

        <Box flexGrow={1} />

        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          <Box
            height={toolbarItemHeight}
            bgcolor="#333"
            borderRadius={2}
            paddingX={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Badge
              variant="dot"
              overlap="circular"
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              color={connecting ? 'warning' : connected ? 'success' : 'error'}
            >
              <Avatar src="/chain-images/polygon.png" sx={{ width: 32, height: 32 }} />
            </Badge>
          </Box>

          {walletConnected ? 
            <AccountBox height={toolbarItemHeight} />
            : 
            (
              <Button variant="contained" onClick={() => connectWallet()} sx={{ height: toolbarItemHeight }}>
                Connect Wallet
              </Button>
            )
          }
        </Stack>
      </Toolbar>
    </AppBar>
  )
};

export default TopBar;
