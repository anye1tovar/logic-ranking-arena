import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f4c542"
    },
    secondary: {
      main: "#b7ff00"
    },
    background: {
      default: "#1e1230",
      paper: "rgba(42, 24, 71, 0.85)"
    },
    text: {
      primary: "#ffffff",
      secondary: "#cabcf4"
    },
    success: {
      main: "#b7ff00"
    },
    warning: {
      main: "#f4c542"
    }
  },
  typography: {
    fontFamily: '"Rajdhani", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 800
    },
    h2: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 800
    },
    h3: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700
    },
    button: {
      fontWeight: 700,
      letterSpacing: "0.04em",
      textTransform: "none"
    }
  },
  shape: {
    borderRadius: 18
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 14
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    }
  }
});
