import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";

import { useRankingSync } from "../hooks/use-ranking-sync";
import { muiTheme } from "../styles/themes/mui-theme";
import { AppRouter } from "./router/app-router";

const AppContent = () => {
  useRankingSync();

  return <AppRouter />;
};

export const App = () => (
  <ThemeProvider theme={muiTheme}>
    <CssBaseline />
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </ThemeProvider>
);
