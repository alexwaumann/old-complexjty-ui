import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {useState} from "react";

import {
  useAccount,
} from "../connectors/metamask";

/*
 * TODO
 * Avatar border color based on player rank (determined by server rr)
 * Menu should display:
 *    * Address and rank info
 *    * Wallet network status
 *    * Verification status (enables social features)
 *    * Settings
 *    * Disconnect option (should disconnect wallet + remove reset verification status)
 * Display a way for the user to connect wallet to correct network
 */

const AccountBox = () => {
  const walletAddress = useAccount();
  // const displayName = 'Godyl'; // useAuth((state) => state.displayName);
  const displayName = `${walletAddress?.slice(0, 5)}...${walletAddress?.slice(38)}`;

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleAvatarClicked = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <Box
      height={52}
      color="000000"
      bgcolor="#ffffff33"
      borderRadius={2}
      paddingLeft={2}
      paddingRight={1}
      display="flex"
      alignItems="center"
    >
      <Stack direction="row" alignItems="center">
        <Badge variant="dot" color="success" />
        <Box m={1} />
        <Typography variant="caption">{displayName}</Typography>
      </Stack>

      <Box m={1} />

      <IconButton onClick={handleAvatarClicked} sx={{ padding: 0 }}>
        <Avatar
          src="/placeholder-pfp.webp"
          sx={{ border: 1, borderWidth: 2, borderColor: 'white' }}
        />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ elevation: 0, sx: { mt: 1, borderRadius: 2, color: 'white', bgcolor: '#ffffff33' } }}
      >
        <MenuItem sx={{ pointerEvents: 'none' }}>
          <Stack direction="row" alignItems="center">
            <Badge variant="dot" color="success" />
            <Box m={1} />
            <Typography variant="caption">{walletAddress}</Typography>
          </Stack>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="caption">Get verified to access social features</Typography>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="caption">Profile</Typography>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="caption">Settings</Typography>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="caption">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </Box>
  )
};

export default AccountBox;
