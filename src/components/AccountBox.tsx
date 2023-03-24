import {
  Avatar,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

import {
  useAccount,
} from "../connectors/metamask";

/*
 * TODO
 * Avatar border color based on player rank (determined by server rr)
 * Avatar should be a menu button
 * Menu should display:
 *    * Address and rank info
 *    * Wallet network status
 *    * Verification status (enables social features)
 *    * Settings
 *    * Disconnect option (should disconnect wallet + remove reset verification status)
 */

const AccountBox = () => {
  const walletAddress = useAccount();
  // const displayName = 'Godyl'; // useAuth((state) => state.displayName);
  const displayName = `${walletAddress?.slice(0, 5)}...${walletAddress?.slice(38)}`;

  return (
    <Box
      height={52}
      color="000000"
      bgcolor="#ffffff44"
      borderRadius={2}
      paddingX={1}
      display="flex"
      alignItems="center"
    >
      <Typography variant="caption">{displayName}</Typography>

      <Box m={1} />

      <IconButton sx={{ padding: 0 }}>
        <Avatar
          src="/placeholder-pfp.webp"
          sx={{ border: 1, borderWidth: 2, borderColor: 'white' }}
        />
      </IconButton>
    </Box>
  )
};

export default AccountBox;
