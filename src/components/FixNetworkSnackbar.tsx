import { Alert, Button, Snackbar, Typography } from "@mui/material";
import { useState } from "react";

import { useWallet, wallet } from "../services/wallet";

const FixNetworkSnackbar = () => {
  const onTargetChain = useWallet((state) => state.onTargetChain);
  const [fixInProgress, setFixInProgress] = useState<boolean>(false);

  const fixNetwork = async () => {
    setFixInProgress(true);
    await wallet.fixNetwork();
    setFixInProgress(false);
  };

  return (
    <Snackbar open={!onTargetChain} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert
        severity="error"
        action={<Button color="secondary" disabled={fixInProgress} onClick={fixNetwork}>Fix</Button>
}
        sx={{ width: '100%' }}
      >
        <Typography>Your wallet is not connected to Polygon Mainnet</Typography>
      </Alert>
    </Snackbar>
  );
};

export default FixNetworkSnackbar;
