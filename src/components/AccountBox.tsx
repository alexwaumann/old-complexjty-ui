import { VerifiedRounded } from "@mui/icons-material";
import {
  Avatar,
  ButtonBase,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {useState} from "react";

import useAuth, { connectWallet, disconnectWallet } from "../hooks/useAuth";

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
  const rank = useAuth((auth) => auth.rank);

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
          {verified && <VerifiedRounded color="primary" />}

          <Stack direction="column">
            {username && <Typography variant="caption">{username}</Typography>}
            <Typography variant="caption">{`${address?.slice(0, 5)}...${address?.slice(38)}`}</Typography>
          </Stack>

          <Avatar
            src={avatarUrl ? avatarUrl : ''}
            sx={{
              border: 1,
              borderWidth: 3,
              borderColor: `rank.${rank?.toLowerCase()}`,
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
          <Typography variant="subtitle2">{address}</Typography>
        </MenuItem>

        {!onTargetChain && <Divider />}
        {!onTargetChain && (
          <MenuItem onClick={connectWallet}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src="chain-images/polygon.png" sx={{ height: 22, width: 22 }} />
              <Typography variant="body2">Switch to Polygon Mainnet</Typography>
            </Stack>
          </MenuItem>
        )}

        {!verified && <Divider />}
        {!verified && (
          <MenuItem>
            <ListItemIcon>
              <VerifiedRounded color="primary" />
            </ListItemIcon>
            <Typography variant="body2">Get verified to access social features</Typography>
          </MenuItem>
        )}

        <Divider />
        <MenuItem>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>

        <Divider />
        <MenuItem>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <Divider />
        <MenuItem onClick={() => disconnectWallet()}>
          <Typography variant="body2">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </>
  )
};

export default AccountBox;
