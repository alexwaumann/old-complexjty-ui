import {
  Avatar,
  Box,
  CssBaseline,
  Drawer,
  Stack,
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

      <Drawer variant="permanent">
        <Box alignItems="center" sx={{ width: 72, pt: 2 }}>
          <Stack direction="column" alignItems="center" justifyContent="flex-start" spacing={2}>
            <Avatar src="/logo.png" />
          </Stack>
        </Box>
      </Drawer>

      <Box sx={{ ml: 9, mt: 2 }}>
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
