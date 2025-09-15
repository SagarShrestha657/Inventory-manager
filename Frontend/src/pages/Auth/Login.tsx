import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { TextField, Button, Typography, Box, Container, ThemeProvider, Snackbar, Alert, CircularProgress } from '@mui/material';
import useAuthStore from '../../store/authStore'; // Import zustand store
import { authTheme } from './theme';

const Login = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const { email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.login(formData);
      setSnackbar({ open: true, message: 'Login successful!', severity: 'success' });
      navigate('/dashboard'); // Redirect to dashboard on successful login
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.response && error.response.data && error.response.data.message) {
        if (error.response.status === 401 && error.response.data.message === 'Account not verified. Please verify your OTP.') {
          navigate('/verify-otp', { state: { email: formData.email } });
        } else {
          setSnackbar({ open: true, message: error.response.data.message, severity: 'error' });
        }
      } else {
        setSnackbar({ open: true, message: 'Login failed. Please check your credentials.', severity: 'error' });
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
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            Login to your account
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
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
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                mt: 2,
              }}
            >
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', textDecoration: 'none', color: authTheme.palette.primary.main }}>
                Forgot password?
              </Link>
              <Link to="/signup" style={{ fontSize: '0.8rem', textDecoration: 'none', color: authTheme.palette.secondary.main }}>
                Don't have an account? Sign Up
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

export default Login;