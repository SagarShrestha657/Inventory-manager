import React, { useState } from 'react';
import authService from '../services/authService';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  TextField,
  useTheme,
  Link,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import useAuthStore from '../store/authStore';

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'password' | 'otp' | 'done'>('password');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Removed language state

  // Change password dialog state
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Change password via OTP dialog state
  const [otpPwdOpen, setOtpPwdOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'done'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const user = {
    name: useAuthStore.getState().username,
    email: useAuthStore.getState().email,
    avatar: '',
  }


  const handleLogout = () => {
    authService.logout();
    setLogoutDialogOpen(false);
    window.location.href = '/login';
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setDeleteLoading(true);
    try {
      if (deleteStep === 'password') {
        await authService.requestDeleteAccount(deletePassword);
        setDeleteStep('otp');
        setDeleteLoading(false);
        return;
      }
      if (deleteStep === 'otp') {
        await authService.confirmDeleteAccount(deleteOtp);
        setDeleteStep('done');
        setDeleteLoading(false);
        setTimeout(() => {
          setDeleteDialogOpen(false);
          setDeleteStep('password');
          setDeletePassword('');
          setDeleteOtp('');
          setDeleteError('');
          authService.logout();
          window.location.href = '/signup';
        }, 2000);
        return;
      }
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto"  display="flex" flexDirection="column" alignItems="center">
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
            variant="contained"
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
          {/* Change Password via OTP Dialog */}
          <Dialog open={otpPwdOpen} onClose={() => {
            setOtpPwdOpen(false);
            setOtpStep('request');
            setOtpValue('');
            setOtpNewPassword('');
            setOtpConfirmPassword('');
            setOtpError('');
            setOtpSuccess('');
          }}>
            <DialogTitle>Change Password via OTP</DialogTitle>
            <DialogContent>
              {otpStep === 'request' && (
                <>
                  <Typography mb={2}>Send OTP to your email to change your password.</Typography>
                  {otpError && <Typography color="error" mt={1}>{otpError}</Typography>}
                </>
              )}
              {otpStep === 'verify' && (
                <>
                  <TextField
                    label="OTP"
                    type="text"
                    fullWidth
                    margin="normal"
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    autoComplete="one-time-code"
                    disabled={otpLoading}
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={otpNewPassword}
                    onChange={e => setOtpNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={otpLoading}
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={otpConfirmPassword}
                    onChange={e => setOtpConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={otpLoading}
                  />
                  {otpError && <Typography color="error" mt={1}>{otpError}</Typography>}
                </>
              )}
              {otpStep === 'done' && (
                <Typography color="success.main" mb={2}>Password changed successfully.</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setOtpPwdOpen(false);
                setOtpStep('request');
                setOtpValue('');
                setOtpNewPassword('');
                setOtpConfirmPassword('');
                setOtpError('');
                setOtpSuccess('');
              }} disabled={otpLoading || otpStep === 'done'}>Cancel</Button>
              {otpStep === 'request' && (
                <Button
                  onClick={async () => {
                    setOtpError('');
                    setOtpLoading(true);
                    try {
                      await authService.requestChangePasswordOtp();
                      setOtpStep('verify');
                    } catch (err: any) {
                      setOtpError(err?.response?.data?.message || 'Failed to send OTP.');
                    } finally {
                      setOtpLoading(false);
                    }
                  }}
                  color="primary"
                  variant="contained"
                  disabled={otpLoading}
                >
                  Send OTP
                </Button>
              )}
              {otpStep === 'verify' && (
                <Button
                  onClick={async () => {
                    setOtpError('');
                    if (!otpValue || !otpNewPassword || !otpConfirmPassword) {
                      setOtpError('All fields are required.');
                      return;
                    }
                    if (otpNewPassword !== otpConfirmPassword) {
                      setOtpError('New passwords do not match.');
                      return;
                    }
                    setOtpLoading(true);
                    try {
                      await authService.changePasswordWithOtp(otpValue, otpNewPassword);
                      setOtpStep('done');
                    } catch (err: any) {
                      setOtpError(err?.response?.data?.message || 'Failed to change password.');
                    } finally {
                      setOtpLoading(false);
                    }
                  }}
                  color="primary"
                  variant="contained"
                  disabled={otpLoading}
                >
                  Change Password
                </Button>
              )}
            </DialogActions>
          </Dialog>
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
      {/* Change Password Dialog */}
      <Dialog open={changePwdOpen} onClose={() => {
        setChangePwdOpen(false);
        setPwdError('');
        setPwdSuccess('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {pwdError && <Typography color="error" mt={1}>{pwdError}</Typography>}
          {pwdSuccess && <Typography color="success.main" mt={1}>{pwdSuccess}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setChangePwdOpen(false);
            setPwdError('');
            setPwdSuccess('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }}>Cancel</Button>
          <Button
            onClick={async () => {
              setPwdError('');
              setPwdSuccess('');
              if (!currentPassword || !newPassword || !confirmPassword) {
                setPwdError('All fields are required.');
                return;
              }
              if (newPassword !== confirmPassword) {
                setPwdError('New passwords do not match.');
                return;
              }
              setPwdLoading(true);
              try {
                await authService.changePassword(currentPassword, newPassword);
                setPwdSuccess('Password changed successfully.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              } catch (err: any) {
                setPwdError(err?.response?.data?.message || 'Failed to change password.');
              } finally {
                setPwdLoading(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={pwdLoading}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to logout?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout} color="primary" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Secure Flow Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => {
        setDeleteDialogOpen(false);
        setDeleteStep('password');
        setDeletePassword('');
        setDeleteOtp('');
        setDeleteError('');
      }}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          {deleteStep === 'password' && (
            <>
              <Typography color="error" mb={2}>Enter your password to continue.</Typography>
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                disabled={deleteLoading}
              />
            </>
          )}
          {deleteStep === 'otp' && (
            <>
              <Typography color="error" mb={2}>Enter the OTP sent to your email.</Typography>
              <TextField
                label="OTP"
                type="text"
                fullWidth
                margin="normal"
                value={deleteOtp}
                onChange={e => setDeleteOtp(e.target.value)}
                autoComplete="one-time-code"
                disabled={deleteLoading}
              />
            </>
          )}
          {deleteStep === 'done' && (
            <Typography color="success.main" mb={2}>Account deleted successfully.</Typography>
          )}
          {deleteError && <Typography color="error" mt={1}>{deleteError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDeleteDialogOpen(false);
            setDeleteStep('password');
            setDeletePassword('');
            setDeleteOtp('');
            setDeleteError('');
          }} disabled={deleteLoading || deleteStep === 'done'}>Cancel</Button>
          {deleteStep !== 'done' && (
            <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={deleteLoading || (deleteStep === 'password' ? !deletePassword : !deleteOtp)}>
              {deleteStep === 'password' ? 'Next' : 'Delete'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
