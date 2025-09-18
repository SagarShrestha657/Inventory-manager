import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import authService from '../../services/authService';

interface LogoutConfirmDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  open,
  onClose,
}) => {
  const handleLogout = () => {
    authService.logout();
    onClose();
    window.location.href = '/login';
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to logout?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogout} color="primary" variant="contained">Logout</Button>
      </DialogActions>
    </Dialog>
  );
};