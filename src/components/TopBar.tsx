import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
} from "@mui/material";

import AccountBox from "./AccountBox";
import useAuth from "../hooks/useAuth";
import { connectWallet } from "../services/metamask";

const toolbarHeight = 72;
const toolbarPaddingY = 1;
const toolbarItemHeight = toolbarHeight - toolbarPaddingY * 2 * 8;

const TopBar = () => {
  const walletConnected = useAuth((auth) => auth.connected);

  return(
    <AppBar position="absolute" elevation={0} sx={{ background: '#12121299' }}>
      <Toolbar sx={{ height: toolbarHeight, py: toolbarPaddingY }}>
        <Avatar 
          variant="rounded"
          src="/logo.png"
          sx={{ height: toolbarItemHeight, width: toolbarItemHeight, borderRadius: 2 }}
        />

        <Box flexGrow={1} />

        {walletConnected ? 
          <AccountBox height={toolbarItemHeight} />
          : 
          (
            <Button variant="contained" onClick={() => connectWallet()} sx={{ height: toolbarItemHeight }}>
              Connect Wallet
            </Button>
          )
        }
      </Toolbar>
    </AppBar>
  )
};

export default TopBar;
