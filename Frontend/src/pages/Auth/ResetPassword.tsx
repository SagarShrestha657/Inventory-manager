import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { TextField, Button, Typography, Box, Container, ThemeProvider, Snackbar, Alert, CircularProgress } from '@mui/material';
import { authTheme } from './theme';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const { email, otp, newPassword, confirmPassword } = formData;

  const location = useLocation();
  const navigate = useNavigate();

  // Pre-fill email and OTP if coming from forgot password flow
  React.useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.otp) {
      setFormData(prev => ({ ...prev, otp: location.state.otp }));
    }
  }, [location.state]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match.', severity: 'error' });
      setLoading(false);
    } else {
      try {
        await authService.resetPassword({ email, otp, newPassword });
        setSnackbar({ open: true, message: 'Password has been reset successfully. You can now log in.', severity: 'success' });
        navigate('/login');
      } catch (error: any) {
        console.error('Password reset failed:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setSnackbar({ open: true, message: error.response.data.message, severity: 'error' });
        } else {
          setSnackbar({ open: true, message: 'Password reset failed. Please try again.', severity: 'error' });
        }
      } finally {
        setLoading(false);
      }
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
            Reset Password
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            Enter your new password.
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
              disabled={!!location.state?.email}
            />
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
              disabled={!!location.state?.otp}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="New Password"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={onChange}
              inputProps={{ minLength: 6 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
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
              {loading ? <CircularProgress size={24} /> : 'Reset Password'}
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

export default ResetPassword;