import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { TextField, Button, Typography, Box, Container, ThemeProvider, CircularProgress, Snackbar, Alert } from '@mui/material';
import useAuthStore from '../../store/authStore'; // Import zustand store
import { authTheme } from './theme';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // New state for error messages
  const location = useLocation();
  const email = location.state?.email || '';
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null); // Clear previous errors on change
    setOtp(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null); // Clear previous errors on submit
    setLoading(true);

    try {
      const response = await authService.verifyOtp(email, otp);
      // Upon successful verification, the backend now returns a token and userId
      if (response.token && response.userId) {
        useAuthStore.getState().setToken(response.token, response.userId, response.username, response.email);
        setSnackbar({ open: true, message: 'OTP verified successfully. You are now logged in.', severity: 'success' });
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } else {
        setErrorMessage(response.message || 'OTP verification failed. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message); // Set error message from backend
      } else {
        setErrorMessage('OTP verification failed. Please try again.'); // Generic error
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
            Verify Your Account
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            Please enter the OTP sent to {email}
          </Typography>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="OTP"
              name="otp"
              autoComplete="one-time-code"
              value={otp}
              onChange={onChange}
              inputProps={{ minLength: 6 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mt: 2,
              }}
            >
              <Link to="/resend-otp" style={{ textDecoration: 'none', color: authTheme.palette.primary.main }}>
                Didn't receive OTP? Resend OTP
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

export default OTPVerification;
