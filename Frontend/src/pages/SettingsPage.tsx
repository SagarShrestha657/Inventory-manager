import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  useTheme,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import useAuthStore from '../store/authStore';

// Import the new dialog components
import { ChangePasswordDialog } from '../components/settings/ChangePasswordDialog';
import { ChangePasswordOtpDialog } from '../components/settings/ChangePasswordOtpDialog';
import { ChangeUsernameDialog } from '../components/settings/ChangeUsernameDialog';
import { DeleteAccountDialog } from '../components/settings/DeleteAccountDialog';
import { LogoutConfirmDialog } from '../components/settings/LogoutConfirmDialog';
import CurrencySelection from '../components/settings/CurrencySelection';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [otpPwdOpen, setOtpPwdOpen] = useState(false);
  const [changeUsernameDialogOpen, setChangeUsernameDialogOpen] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const user = {
    name: useAuthStore.getState().username,
    email: useAuthStore.getState().email,
    avatar: '',
  }

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <Box maxWidth={500} mx="auto" display="flex" flexDirection="column" alignItems="center">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 420, mb: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={1} mb={3}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: theme.palette.primary.main, fontSize: 32, mb: 1 }}>
            {user.avatar
              ? <img src={user.avatar} style={{ width: '100%', height: '100%' }} />
              : <PersonIcon sx={{ fontSize: 48 }} />}
          </Avatar>
          <Typography variant="h6" fontWeight={600}>{user.name}</Typography>
          <Typography variant="body2" color="textSecondary">{user.email}</Typography>
        </Box>
      </Paper>
      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 420, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600} sx={{ mb: 2 }}>Account</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setChangePwdOpen(true)}
            fullWidth
            sx={{ fontWeight: 500 }}
          >
            Change Password
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOtpPwdOpen(true)}
            fullWidth
            sx={{ fontWeight: 500 }}
          >
            Change Password via OTP
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setChangeUsernameDialogOpen(true)}
            fullWidth
            sx={{ fontWeight: 500 }}
          >
            Change Username
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={() => setLogoutDialogOpen(true)}
            fullWidth
            sx={{ fontWeight: 500 }}
          >
            Logout
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth
            sx={{ fontWeight: 500 }}
          >
            Delete Account
          </Button>
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 3, width: '100%', maxWidth: 420, mb: 3 }}>
        <CurrencySelection />
      </Paper>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, width: '100%', maxWidth: 420, textAlign: 'center', bgcolor: theme.palette.grey[50] }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={600}>App Info</Typography>
        <Typography variant="body2" color="textSecondary" mb={0.5}>
          Version: <b>0.1.0</b>
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={0.5}>
          Contact: <Link href="mailto:shresthasagar657@gmail.com">shresthasagar657@gmail.com</Link>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Help: <Link href="https://github.com/SagarShrestha657/Inventory-manager" target="_blank" rel="noopener">View Documentation</Link>
        </Typography>
      </Paper>

      {/* Dialog Components */}
      <ChangePasswordDialog
        open={changePwdOpen}
        onClose={() => setChangePwdOpen(false)}
        onSuccess={showSnackbar}
        onError={showSnackbar}
      />
      <ChangePasswordOtpDialog
        open={otpPwdOpen}
        onClose={() => setOtpPwdOpen(false)}
        onSuccess={showSnackbar}
        onError={showSnackbar}
      />
      <ChangeUsernameDialog
        open={changeUsernameDialogOpen}
        onClose={() => setChangeUsernameDialogOpen(false)}
        onSuccess={showSnackbar}
        onError={showSnackbar}
      />
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onSuccess={showSnackbar}
        onError={showSnackbar}
      />
      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default SettingsPage;