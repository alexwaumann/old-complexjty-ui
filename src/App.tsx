import {
  Avatar,
  Box,
  CssBaseline,
  Drawer,
  Stack,
  ThemeProvider,
} from '@mui/material';

import TopBar from './components/TopBar';
import darkTheme from './darkTheme';

const App = () => {


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />

      <TopBar />

      <Drawer variant="permanent">
        <Box alignItems="center" sx={{ width: 72, pt: 2 }}>
          <Stack direction="column" alignItems="center" justifyContent="flex-start" spacing={2}>
            <Avatar src="/logo.jpg" />
          </Stack>
        </Box>
      </Drawer>

    </ThemeProvider>
  )
}

export default App
