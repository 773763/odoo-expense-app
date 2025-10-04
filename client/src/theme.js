// client/src/theme.js
import { createTheme } from '@mui/material/styles';

// Define your professional theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#673AB7', // A professional deep purple color
    },
    secondary: {
      main: '#FFC107', // An accent color
    },
    background: {
      default: '#f4f6f8', // A light grey background for a softer look
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600, // Make headings a bit bolder
    },
  },
  // Apply consistent styling to all components
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Softer corners for Paper elements like tables
          boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px', // A subtle shadow
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Softer corners for buttons
          textTransform: 'none', // Use normal case for button text
          fontWeight: 'bold',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined', // All text fields will be outlined
        size: 'small',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 'bold', // Bold table headers
        },
      },
    },
  },
});

export default theme;