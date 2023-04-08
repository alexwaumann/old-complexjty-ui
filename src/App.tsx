import {
  Box,
  CssBaseline,
  ThemeProvider,
} from '@mui/material';
import { Route, Switch } from 'wouter';

import TopBar from './components/TopBar';
import darkTheme from './darkTheme';
import TradePage from './pages/TradePage';

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />

      <TopBar />

      <Box sx={{ pt: 11, pb: 2, height: '100vh', overflow: 'auto' }}>
        <Switch>

          <Route path="/">
            <TradePage />
          </Route>

        </Switch>
      </Box>

    </ThemeProvider>
  )
};

export default App;
