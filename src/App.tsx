import {
  Box,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { Route, Switch } from 'wouter';

import FixNetworkSnackbar from './components/FixNetworkSnackbar';
import TopBar from './components/TopBar';
import darkTheme from './darkTheme';
import TradePage from './pages/TradePage';
import { useOracleService } from './services/oracle';
import { useUserService } from './services/user';
import { useWalletService } from './services/wallet';

const App = () => {
  useOracleService();
  useWalletService();
  useUserService();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />

      <TopBar />

      <Box sx={{ pt: 10, pb: 2, height: '100vh', overflow: 'auto' }}>
        <Switch>

          <Route path="/">
            <TradePage />
          </Route>

        </Switch>
      </Box>

      <FixNetworkSnackbar />

    </ThemeProvider>
  )
};

export default App;
