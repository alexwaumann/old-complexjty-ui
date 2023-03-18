import {
  AppBar,
  Avatar,
  Box,
  Button,
  CssBaseline,
  Drawer,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography
} from '@mui/material'

import darkTheme from './darkTheme';


function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />

      <AppBar position="relative" color="transparent" elevation={0} variant="outlined">
        <Toolbar>
          <Box mr={9} />
          <Typography variant="h6" flexGrow={1}>Page Title</Typography>
          <Button variant="outlined">Connect Wallet</Button>
        </Toolbar>
      </AppBar>

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
