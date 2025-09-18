import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import API_BASE_URL from '../../config';

const GOALS_API_URL = `${API_BASE_URL}/goal`;

// Helper to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

interface SetGoalDialogProps {
  open: boolean;
  onClose: () => void;
  refetchGoal: () => void;
}

export const SetGoalDialog: React.FC<SetGoalDialogProps> = ({
  open,
  onClose,
  refetchGoal,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [salesTarget, setSalesTarget] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setSalesTarget('');
    setProfitTarget('');
    setDurationMonths('1');
    onClose();
  };

  const handleSaveGoals = async () => {
    if (!salesTarget || !profitTarget || !durationMonths) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    const salesTargetNum = Number(salesTarget);
    const profitTargetNum = Number(profitTarget);
    const durationMonthsNum = Math.max(1, Math.floor(Number(durationMonths)));

    if (isNaN(salesTargetNum) || salesTargetNum <= 0) {
      enqueueSnackbar('Sales target must be a positive number', { variant: 'error' });
      return;
    }
    if (isNaN(profitTargetNum) || profitTargetNum <= 0) {
      enqueueSnackbar('Profit target must be a positive number', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const deadline = new Date(startDate);
      deadline.setMonth(deadline.getMonth() + durationMonthsNum);
      deadline.setHours(23, 59, 59, 999);

      await axios.post(GOALS_API_URL, {
        targetAmount: salesTargetNum,
        targetProfit: profitTargetNum,
        durationMonths: durationMonthsNum,
        deadline: deadline,
        startDate: startDate,
      }, getAuthHeaders());
      refetchGoal();
      enqueueSnackbar('Goal saved successfully!', { variant: 'success' });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to save goal. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Set Your Goal
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monthly Sales Target (NPR)"
                type="number"
                value={salesTarget}
                onChange={(e) => setSalesTarget(e.target.value)}
                sx={{ mb: 3 }}
                helperText="Your target sales revenue for the duration"
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Monthly Profit Target (NPR)"
                type="number"
                value={profitTarget}
                onChange={(e) => setProfitTarget(e.target.value)}
                sx={{ mb: 3 }}
                helperText="Your target profit for the duration"
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Duration (Months)"
                type="number"
                value={durationMonths}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) > 0 && Number.isInteger(Number(value)))) {
                    setDurationMonths(value);
                  }
                }}
                inputProps={{ min: 1, step: 1 }}
                helperText="Number of months for this goal"
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        <Button
          onClick={handleSaveGoals}
          variant="contained"
          disabled={loading || !salesTarget || !profitTarget || !durationMonths}
        >
          Set Goal
        </Button>
      </DialogActions>
    </Dialog>
  );
};