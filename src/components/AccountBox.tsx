import {
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {useState} from "react";

import {
  useAccount,
} from "../connectors/metamask";

// TODO: TOMORROW
// show state of connection with identifiers

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
  const displayName = 'Godyl'; // useAuth((state) => state.displayName);
  const displayAddress = `${walletAddress?.slice(0, 5)}...${walletAddress?.slice(38)}`;

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  const handleAvatarClicked = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <>
      <ButtonBase onClick={handleAvatarClicked} sx={{ height: 52, bgcolor: '#444', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mx={1}>
          <Stack direction="column">
            <Typography variant="caption">{displayName}</Typography>
            <Typography variant="caption">{displayAddress}</Typography>
          </Stack>
          <Avatar
            src="/placeholder-pfp.webp"
            sx={{
              border: 1,
              borderWidth: 2,
            }}
          />
        </Stack>
      </ButtonBase>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, borderRadius: 2, background: '#444' } }}
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
    </>
  )
};

export default AccountBox;
