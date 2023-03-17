import { AppBar, Avatar, Button, CssBaseline, ThemeProvider, Toolbar, Typography } from '@mui/material'

import darkTheme from './darkTheme';


function App() {

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <AppBar position="relative" color="transparent" elevation={0}>
        <Toolbar>
          <Avatar src="/logo.jpg" sx={{ mr: 2 }} />
          <Typography variant="h6" flexGrow={1}>Complexjty</Typography>
          <Button variant="outlined">Connect Wallet</Button>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  )
}

export default App
