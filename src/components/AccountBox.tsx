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

import useAuth from "../hooks/useAuth";
import Pfp from "./Pfp";
import { wallet } from '../services/wallet';
import TokenBalanceList from "./TokenBalanceList";

const AccountBox = ({height}: {height: number}) => {
  const address = useAuth((auth) => auth.address);
  const verified = useAuth((auth) => auth.verified);
  const username =  useAuth((auth) => auth.username);
  const pfp = useAuth((auth) => auth.pfp);
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
      <ButtonBase onClick={handleAvatarClicked} sx={{ height, bgcolor: '#333', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mx={1}>
          {verified && <VerifiedRounded color="primary" sx={{ height: 28, width: 28 }} />}

          <Stack direction="column">
            {username && <Typography variant="caption" fontWeight={700}>{username}</Typography>}
            <Typography variant="caption" fontWeight={700}>
              {`${address?.slice(0, 5)}...${address?.slice(38)}`}
            </Typography>
          </Stack>

          <Pfp size={height - 12} pfp={pfp} rank={rank} />
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
            <Pfp size={128} border={4} pfp={pfp} rank={rank} />
            <Typography variant="h6" fontWeight={700}>{username}</Typography>
            <Typography variant="caption" fontWeight={700}>{address}</Typography>
          </Stack>
        </MenuItem>

        <Divider />
        <MenuItem sx={{ pointerEvents: 'none' }}>
          <TokenBalanceList />
        </MenuItem>

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
        <MenuItem onClick={() => wallet.disconnect()}>
          <Typography variant="body2">Disconnect</Typography>
        </MenuItem>
      </Menu>
    </>
  )
};

export default AccountBox;
