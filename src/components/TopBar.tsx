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

import {
  useIsActive,
  useIsActivating,
} from "../connectors/network";

const TopBar = () => {
  const connected = useIsActive();
  const connecting = useIsActivating();

  return(
    <AppBar position="relative" color="transparent" elevation={0} variant="outlined">
      <Toolbar>
        <Box mr={9} />
        <Typography variant="h6" flexGrow={1}>Page Title</Typography>

        <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={2}>
          <Button variant="outlined" sx={{ pointerEvents: 'none' }}>
            <Badge
              variant="dot"
              overlap="circular"
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              color={connecting ? 'warning' : connected ? 'success' : 'error'}
            >
              <Avatar src="/chain-images/polygon.png" sx={{ width: 24, height: 24 }} />
            </Badge>
          </Button>

          <Button
            variant="outlined"
          >
            Connect Wallet
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  )
};

export default TopBar;
