import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
} from "@mui/material";

import AccountBox from "./AccountBox";
import useAuth from "../hooks/useAuth";
import { useWallet, wallet } from "../services/wallet";

const toolbarHeight = 72;
const toolbarPaddingY = 1;
const toolbarItemHeight = toolbarHeight - toolbarPaddingY * 2 * 8;

const TopBar = () => {
  const isUserConnected = useAuth((auth) => auth.connected);
  const isWalletActive = useWallet((state) => state.isActive);
  const isAccountConnecting = useWallet((state) => state.isAccountConnecting);

  return(
    <AppBar position="absolute" elevation={0} sx={{ background: '#12121299' }}>
      <Toolbar sx={{ height: toolbarHeight, py: toolbarPaddingY }}>
        <Avatar 
          variant="rounded"
          src="/logo.png"
          sx={{ height: toolbarItemHeight, width: toolbarItemHeight, borderRadius: 2 }}
        />

        <Box flexGrow={1} />

        {isUserConnected ? 
          <AccountBox height={toolbarItemHeight} />
          : 
          (
            <Button
              variant="contained"
              disabled={!isWalletActive || isAccountConnecting}
              onClick={() => wallet.connect()}
              sx={{ height: toolbarItemHeight }}
            >
              Connect Wallet
            </Button>
          )
        }
      </Toolbar>
    </AppBar>
  )
};

export default TopBar;
