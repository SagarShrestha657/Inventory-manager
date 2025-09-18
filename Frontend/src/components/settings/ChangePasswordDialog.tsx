import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import authService from '../../services/authService';

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
  onError: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleClose = () => {
    setPwdError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleChangePassword = async () => {
    setPwdError('');
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
      onSuccess('Password changed successfully!', 'success');
      handleClose();
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Failed to change password.', 'error');
      setPwdError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={pwdLoading}>Cancel</Button>
        <Button
          onClick={handleChangePassword}
          color="primary"
          variant="contained"
          disabled={pwdLoading}
        >
          Change Password
        </Button>
      </DialogActions>
    </Dialog>
  );
};