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

interface ChangePasswordOtpDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
  onError: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ChangePasswordOtpDialog: React.FC<ChangePasswordOtpDialogProps> = ({
  open,
  onClose,
  onSuccess,
  onError,
}) => {
  const [otpStep, setOtpStep] = useState<'request' | 'verify' | 'done'>('request');
  const [otpValue, setOtpValue] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const handleClose = () => {
    setOtpStep('request');
    setOtpValue('');
    setOtpNewPassword('');
    setOtpConfirmPassword('');
    setOtpError('');
    onClose();
  };

  const handleSendOtp = async () => {
    setOtpError('');
    setOtpLoading(true);
    try {
      await authService.requestChangePasswordOtp();
      setOtpStep('verify');
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Failed to send OTP.', 'error');
      setOtpError(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangePasswordWithOtp = async () => {
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
      onSuccess('Password changed successfully!','success');
      handleClose();
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Failed to change password.', 'error');
      setOtpError(err?.response?.data?.message || 'Failed to change password.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
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
        <Button onClick={handleClose} disabled={otpLoading || otpStep === 'done'}>Cancel</Button>
        {otpStep === 'request' && (
          <Button
            onClick={handleSendOtp}
            color="primary"
            variant="contained"
            disabled={otpLoading}
          >
            Send OTP
          </Button>
        )}
        {otpStep === 'verify' && (
          <Button
            onClick={handleChangePasswordWithOtp}
            color="primary"
            variant="contained"
            disabled={otpLoading}
          >
            Change Password
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};