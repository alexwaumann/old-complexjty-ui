import { VerifiedRounded } from "@mui/icons-material";
import {
  ButtonBase,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import {useState} from "react";

import Pfp from "./Pfp";
import { user, useUser } from "../services/user";
import { wallet } from '../services/wallet';
import TokenBalanceList from "./TokenBalanceList";

const AccountBox = ({height}: {height: number}) => {
  const userData = useUser(user.selectors.data);
  const isUserVerified = useUser(user.selectors.isVerified);

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
      <ButtonBase onClick={handleAvatarClicked} sx={{ height, bgcolor: '#333', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mx={1}>
          {isUserVerified && <VerifiedRounded color="primary" sx={{ height: 28, width: 28 }} />}

          <Stack direction="column">
            {userData?.username && <Typography variant="caption" fontWeight={700}>{userData.username}</Typography>}
            <Typography variant="caption" fontWeight={700}>
              {`${userData?.address?.slice(0, 5)}...${userData?.address?.slice(38)}`}
            </Typography>
          </Stack>

          <Pfp size={height - 12} pfp={userData?.pfp} rank={userData?.rank} />
        </Stack>
      </ButtonBase>

      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleCloseMenu}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, borderRadius: 2, background: '#333' } }}
      >
        <MenuItem sx={{ pointerEvents: 'none' }}>
          <Stack direction="column" alignItems="center" justifyContent="center" spacing={1}>
            <Pfp size={128} border={4} pfp={userData?.pfp} rank={userData?.rank} />
            <Typography variant="h6" fontWeight={700}>{userData?.username}</Typography>
            <Typography variant="caption" fontWeight={700}>{userData?.address}</Typography>
          </Stack>
        </MenuItem>

        <Divider />
        <MenuItem sx={{ pointerEvents: 'none' }}>
          <TokenBalanceList />
        </MenuItem>

        {!isUserVerified && <Divider />}
        {!isUserVerified && (
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
        <MenuItem onClick={() => wallet.disconnect()}>
          <Typography variant="body2">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </>
  )
};

export default AccountBox;
