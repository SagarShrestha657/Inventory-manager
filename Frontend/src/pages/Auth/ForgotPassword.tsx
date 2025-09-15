import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { TextField, Button, Typography, Box, Container, ThemeProvider, Snackbar, Alert, CircularProgress } from '@mui/material';
import { authTheme } from './theme';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSnackbar({ open: true, message: 'OTP sent to your email for password reset.', severity: 'success' });
      navigate('/reset-password', { state: { email } });
    } catch (error: any) {
      console.error('Forgot password request failed:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setSnackbar({ open: true, message: error.response.data.message, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Forgot password request failed. Please try again.', severity: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={authTheme}>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'background.paper',
          }}
        >
          <Typography component="h1" variant="h3" color="primary">
            Forgot Password
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            Enter your email to receive a password reset OTP.
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={onChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Request OTP'}
            </Button>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mt: 2,
              }}
            >
              <Link to="/login" style={{ textDecoration: 'none', color: authTheme.palette.primary.main }}>
                Remember your password? Login
              </Link>
            </Box>
          </Box>
        </Box>
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default ForgotPassword;