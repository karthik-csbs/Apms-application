import { createTheme } from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
  palette: {
    mode,

    ...(mode === "light"
      ? {
          primary: {
            main: "#8b1a1a",
          },

          secondary: {
            main: "#d4a017",
          },

          background: {
            default: "#f5f0eb",
            paper: "#ffffff",
          },

          text: {
            primary: "#1a0a0a",
            secondary: "#666666",
          },
        }
      : {
          primary: {
            main: "#b22222",
          },

          secondary: {
            main: "#f0c14b",
          },

          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },

          text: {
            primary: "#ffffff",
            secondary: "#bbbbbb",
          },
        }),
  },

  typography: {
    fontFamily: `"DM Sans", sans-serif`,
  },

  shape: {
    borderRadius: 12,
  },
});

const theme = createTheme(getDesignTokens("light"));

export default theme;