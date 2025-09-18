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
import useAuthStore from '../../store/authStore';

interface ChangeUsernameDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
  onError: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ChangeUsernameDialog: React.FC<ChangeUsernameDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [newUsername, setNewUsername] = useState('');
  const [usernameChangePassword, setUsernameChangePassword] = useState('');
  const [usernameChangeError, setUsernameChangeError] = useState('');
  const [usernameChangeLoading, setUsernameChangeLoading] = useState(false);

  const handleClose = () => {
    setNewUsername('');
    setUsernameChangePassword('');
    setUsernameChangeError('');
    onClose();
  };

  const handleChangeUsername = async () => {
    setUsernameChangeError('');
    if (!newUsername || !usernameChangePassword) {
      setUsernameChangeError('All fields are required.');
      return;
    }
    setUsernameChangeLoading(true);
    try {
      await authService.changeUsername(newUsername, usernameChangePassword);
      onSuccess('Username changed successfully!', 'success');
      useAuthStore.getState().setUsername(newUsername); // Update the username in the store
      handleClose();
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Failed to change username.', 'error');
      setUsernameChangeError(err?.response?.data?.message || 'Failed to change username.');
    } finally {
      setUsernameChangeLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Change Username</DialogTitle>
      <DialogContent>
        <Typography mb={2}>Enter your new username and current password.</Typography>
        <TextField
          label="New Username"
          type="text"
          fullWidth
          margin="normal"
          value={newUsername}
          onChange={e => setNewUsername(e.target.value)}
          autoComplete="username"
          disabled={usernameChangeLoading}
        />
        <TextField
          label="Current Password"
          type="password"
          fullWidth
          margin="normal"
          value={usernameChangePassword}
          onChange={e => setUsernameChangePassword(e.target.value)}
          autoComplete="current-password"
          disabled={usernameChangeLoading}
        />
        {usernameChangeError && <Typography color="error" mt={1}>{usernameChangeError}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={usernameChangeLoading}>Cancel</Button>
        <Button
          onClick={handleChangeUsername}
          color="primary"
          variant="contained"
          disabled={usernameChangeLoading}
        >
          Change Username
        </Button>
      </DialogActions>
    </Dialog>
  );
};