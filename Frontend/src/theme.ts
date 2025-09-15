import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2', // Professional blue - perfect for business applications
      light: '#42A5F5', // Light blue for hover states
      dark: '#1565C0', // Darker blue for active states
    },
    secondary: {
      main: '#42A5F5', // Light blue accent - complements primary
      light: '#90CAF9', // Very light blue for subtle accents
      dark: '#1976D2', // Matches primary for consistency
    },
    background: {
      default: '#F5F7FA', // Clean light grey-blue tint
      paper: '#FFFFFF',    // Pure white for paper components
    },
    text: {
      primary: '#263238', // Dark blue-grey for excellent readability
      secondary: '#546E7A', // Medium blue-grey for secondary text
    },
    success: {
      main: '#4CAF50', // Keep green for success states
    },
    warning: {
      main: '#FF9800', // Orange for warnings
    },
    error: {
      main: '#F44336', // Red for errors
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Standard Material UI font
    h4: {
      fontWeight: 600,
      color: '#263238', // Updated to match new text primary
    },
    h5: {
      fontWeight: 600,
      color: '#263238',
    },
    h6: {
      fontWeight: 500,
      color: '#263238',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          // Global scrollbar styles for a thinner, neutral look
          scrollbarWidth: 'thin', // For Firefox
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400], // Neutral grey scrollbar thumb
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[200], // Lighter neutral grey scrollbar track
          },
        },
      }),
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
