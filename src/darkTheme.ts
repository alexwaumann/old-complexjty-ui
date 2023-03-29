import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    rank: {
      bronze: string
      silver: string
      gold: string
      platinum: string
      diamond: string
      master: string
      god: string
    }
  }

  interface PaletteOptions {
    rank: {
      bronze: string
      silver: string
      gold: string
      platinum: string
      diamond: string
      master: string
      god: string
    }
  }
};

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
    },
    rank: {
      bronze: '#a97142',
      silver: '#808080',
      gold: '#d4af37',
      platinum: '#ce93d8',
      diamond: '#6cace4',
      master: '#710c04',
      god: '#ab47bc',
    },
  },
});

darkTheme = responsiveFontSizes(darkTheme);

export default darkTheme;
