import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Box,
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

// Interface for goal data (re-using from AnalyticsPage)
interface IGoal {
  _id?: string;
  targetAmount: number;
  targetProfit: number;
  deadline: Date | string;
  durationMonths: number;
  startDate: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface EditGoalDialogProps {
  open: boolean;
  onClose: () => void;
  goal: IGoal | undefined; // Pass the current goal object
  refetchGoal: () => void; // Function to refetch goal data in parent
}

export const EditGoalDialog: React.FC<EditGoalDialogProps> = ({
  open,
  onClose,
  goal,
  refetchGoal,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [salesTarget, setSalesTarget] = useState(goal?.targetAmount?.toString() || '');
  const [profitTarget, setProfitTarget] = useState(goal?.targetProfit?.toString() || '');
  const [durationMonths, setDurationMonths] = useState(goal?.durationMonths?.toString() || '1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && goal) {
      setSalesTarget(goal.targetAmount?.toString() || '');
      setProfitTarget(goal.targetProfit?.toString() || '');
      setDurationMonths(goal.durationMonths?.toString() || '1');
    }
  }, [open, goal]);

  const handleClose = () => {
    // Reset state to current goal values when closing, in case of unsaved changes
    setSalesTarget(goal?.targetAmount?.toString() || '');
    setProfitTarget(goal?.targetProfit?.toString() || '');
    setDurationMonths(goal?.durationMonths?.toString() || '1');
    onClose();
  };

  const handleEditgoal = async () => {
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
      await axios.put(GOALS_API_URL, {
        targetAmount: salesTargetNum,
        targetProfit: profitTargetNum,
        durationMonths: durationMonthsNum,
      }, getAuthHeaders());
      refetchGoal();
      enqueueSnackbar('Goal updated successfully!', { variant: 'success' });
      handleClose();
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.message || 'Failed to update goal. Please try again.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Edit Your Goal
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
          onClick={handleEditgoal}
          variant="contained"
          disabled={loading || !salesTarget || !profitTarget || !durationMonths}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};