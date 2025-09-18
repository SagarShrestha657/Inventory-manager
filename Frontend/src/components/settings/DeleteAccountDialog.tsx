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

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
  onError: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [deleteStep, setDeleteStep] = useState<'password' | 'otp' | 'done'>('password');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleClose = () => {
    setDeleteStep('password');
    setDeletePassword('');
    setDeleteOtp('');
    setDeleteError('');
    onClose();
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
        onSuccess('Account deleted successfully!', 'success');
        setTimeout(() => {
          handleClose();
          authService.logout();
          window.location.href = '/signup';
        }, 2000);
        return;
      }
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Failed to delete account.', 'error');
      setDeleteError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
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
        <Button onClick={handleClose} disabled={deleteLoading || deleteStep === 'done'}>Cancel</Button>
        {deleteStep !== 'done' && (
          <Button onClick={handleDeleteAccount} color="error" variant="contained" disabled={deleteLoading || (deleteStep === 'password' ? !deletePassword : !deleteOtp)}>
            {deleteStep === 'password' ? 'Next' : 'Delete'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};