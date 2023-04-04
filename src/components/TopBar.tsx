import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import AccountBox from "./AccountBox";
import {
  useIsActive,
  useIsActivating,
} from "../connectors/network";
import useAuth, { connectWallet } from "../hooks/useAuth";

const TopBar = () => {
  const connected = useIsActive();
  const connecting = useIsActivating();
  const walletConnected = useAuth((auth) => auth.connected);

  return(
    <AppBar position="relative" color="transparent" elevation={0}>
      <Toolbar sx={{ paddingTop: 1, paddingBottom: 1 }}>
        <Box mr={9} />
        <Typography variant="h6" flexGrow={1}>Page Title</Typography>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={1}>
          <Box
            height={64}
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
              <Avatar src="/chain-images/polygon.png" sx={{ width: 28, height: 28 }} />
            </Badge>
          </Box>

          {walletConnected ? <AccountBox /> : (
            <Button variant="contained" onClick={() => connectWallet()} sx={{ height: 64 }}>
              Connect Wallet
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  )
};

export default TopBar;
