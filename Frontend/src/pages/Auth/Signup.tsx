import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { TextField, Button, Typography, Box, Container, ThemeProvider, Snackbar, Alert, CircularProgress } from '@mui/material';
import useAuthStore from '../../store/authStore'; // Import zustand store
import { authTheme } from './theme';

const Signup = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  const { username, email, password, password2 } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== password2) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      setLoading(false);
      return;
    } else {
      try {
        const res = await authService.register({ username, email, password });
        console.log(res);
        setSnackbar({ open: true, message: 'Registration successful! Please check your email for OTP.', severity: 'success' });
        navigate('/verify-otp', { state: { email } }); // Redirect to OTP verification
      } catch (error: any) {
        console.error('Registration failed:', error);
        if (error.response && error.response.data && error.response.data.message) {
          setSnackbar({ open: true, message: error.response.data.message, severity: 'error' });
        } else {
          setSnackbar({ open: true, message: 'Registration failed. Please try again.', severity: 'error' });
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
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
            Sign up for a new account
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={onChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
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
              autoComplete="new-password"
              value={password}
              onChange={onChange}
              inputProps={{ minLength: 6 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password2"
              label="Confirm Password"
              type="password"
              id="password2"
              autoComplete="new-password"
              value={password2}
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
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
                Already have an account? Login
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

export default Signup;