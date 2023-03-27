import { Verified } from "@mui/icons-material";
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

import useAuth, { disconnectWallet } from "../hooks/useAuth";

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
  const onTargetChain = useAuth((auth) => auth.onTargetChain);
  const address = useAuth((auth) => auth.address);
  const verified = useAuth((auth) => auth.verified);
  const username =  useAuth((auth) => auth.username);
  const avatarUrl = useAuth((auth) => auth.avatarUrl);

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
          {verified && <Verified color="primary" />}

          <Stack direction="column">
            {username && <Typography variant="caption">{username}</Typography>}
            <Typography variant="caption">{`${address?.slice(0, 5)}...${address?.slice(38)}`}</Typography>
          </Stack>

          <Avatar
            src={avatarUrl ? avatarUrl : ''}
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
            <Badge variant="dot" color={onTargetChain ? 'success' : 'warning'} />
            <Box m={1} />
            <Typography variant="caption">{address}</Typography>
          </Stack>
        </MenuItem>

        {!verified && <Divider />}
        {!verified && (
          <MenuItem>
            <Typography variant="caption">Get verified to access social features</Typography>
          </MenuItem>
        )}

        <Divider />
        <MenuItem>
          <Typography variant="caption">Profile</Typography>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="caption">Settings</Typography>
        </MenuItem>

        <Divider />
        <MenuItem onClick={() => disconnectWallet()}>
          <Typography variant="caption">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </>
  )
};

export default AccountBox;
