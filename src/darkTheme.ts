import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      light: '#f3e5f5',
      main: '#ce93d8',
      dark: '#ab47bc',
    },
    secondary: {
      light: '#e3f2fd',
      main: '#90caf9',
      dark: '#42a5f5',
    }
  },
});

darkTheme = responsiveFontSizes(darkTheme);

export default darkTheme;
