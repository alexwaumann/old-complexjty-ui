import { createTheme, responsiveFontSizes } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    rarity: {
      common: string
      uncommon: string
      rare: string
      mythic: string
      artifact: string
    }
  }

  interface PaletteOptions {
    rarity: {
      common: string
      uncommon: string
      rare: string
      mythic: string
      artifact: string
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
    rarity: {
      common: 'white',
      uncommon: '#388e3c',
      rare: '#6cace4',
      mythic: '#ce93d8',
      artifact: '#710c04',
    }
  },
});

darkTheme = responsiveFontSizes(darkTheme);

export default darkTheme;
