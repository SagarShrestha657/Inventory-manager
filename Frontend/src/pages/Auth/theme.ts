import { createTheme } from '@mui/material/styles';
import { deepPurple, amber } from '@mui/material/colors';

export const authTheme = createTheme({
  palette: {
    primary: {
      main: deepPurple[500],
    },
    secondary: {
      main: amber[500],
    },
  },
  typography: {
    fontFamily: '"Roboto Slab", serif',
    h3: {
      fontWeight: 700,
      fontSize: '2.5rem',
      marginBottom: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '1rem',
          padding: '10px 20px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '1rem',
          '& label.Mui-focused': {
            color: deepPurple[500],
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: deepPurple[500],
            },
          },
        },
      },
    },
  },
});
