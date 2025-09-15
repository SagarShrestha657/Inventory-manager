import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import API_BASE_URL from '../config';
// Inventory history type for analytics
interface IInventoryHistoryItem {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  changeQuantity: number;
  currentQuantity: number;
  type: 'add' | 'reduce' | 'new_item' | 'delete_item' | 'edit_item';
  priceAtTransaction?: number;
  buyingPriceAtTransaction?: number;
  userId: string;
  timestamp: string;
}

import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  styled,
  Avatar,
  useTheme,
  type SelectChangeEvent as MuiSelectChangeEvent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; // Import DatePicker
import { useQuery } from '@tanstack/react-query';
import {
  Edit as EditIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as ProfitIcon,
} from '@mui/icons-material';

// Analytics type options for the last table
const ANALYTICS_TYPES = [
  { value: 'stock_added', label: 'Stock Added' },
  { value: 'stock_edited', label: 'Stock Edited' },
  { value: 'new_item', label: 'New Item' },
  { value: 'item_deleted', label: 'Item Deleted' },
  { value: 'stock_sold', label: 'Stock Sold' },
];

const API_URL = `${API_BASE_URL}/inventory`;
const GOALS_API_URL = `${API_BASE_URL}/goal`;

// Interface for goal data
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

interface DailyAnalytics {
  totalBuyValue: number;
  totalSellValue: number;
  dailyProfit: number;
}

interface MonthlyAnalytics {
  totalBuyValue: number;
  totalSellValue: number;
  monthlyProfit: number;
}



// Helper to get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// Custom CircularProgress component for goal
const GoalCircularProgress = styled(Box)(() => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Animated CircularProgress for game-like effect
const CircularProgressWithLabel = ({ value, size = 80, thickness = 6, color = 'primary', children }: any) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += (value - start) * 0.15 + 0.5; // Easing
      if (Math.abs(start - value) < 1) {
        setAnimatedValue(value);
      } else {
        setAnimatedValue(start);
        requestAnimationFrame(step);
      }
    };
    step();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <GoalCircularProgress>
      <CircularProgress
        variant="determinate"
        value={Math.min(animatedValue, 100)}
        size={size}
        thickness={thickness}
        color={color}
        sx={{
          color: animatedValue > 100 ? '#4caf50' : undefined,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      {animatedValue > 100 && (
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={thickness}
          sx={{
            color: '#e8f5e8',
            position: 'absolute',
            left: 0,
          }}
        />
      )}
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </GoalCircularProgress>
  );
};

const fetchDailyAnalytics = async (): Promise<DailyAnalytics> => {
  const response = await axios.get(`${API_URL}/analytics/daily`, getAuthHeaders());
  return response.data;
};

const fetchMonthlyAnalytics = async (): Promise<MonthlyAnalytics> => {
  const response = await axios.get(`${API_URL}/analytics/monthly`, getAuthHeaders());
  return response.data;
};


// // Fetch user goal from backend
// const fetchUserGoals = async (): Promise<IGoal[]> => {
//   try {
//     const response = await axios.get(GOALS_API_URL, getAuthHeaders());
//     return response.data.goal || [];
//   } catch (error) {
//     console.error('Error fetching goal:', error);
//     return [];
//   }
// };

// // Save user goal to backend
// const saveUserGoals = async (goalData: {
//   targetAmount: number;
//   targetProfit: number;
//   durationMonths: number;
// }): Promise<IGoal> => {
//   try {
//     const response = await axios.post<{ goal: IGoal }>(
//       GOALS_API_URL,
//       {
//         targetAmount: goalData.targetAmount,
//         targetProfit: goalData.targetProfit,
//         durationMonths: goalData.durationMonths,
//         deadline: new Date(new Date().setMonth(new Date().getMonth() + goalData.durationMonths)),
//         startDate: new Date()
//       },
//       getAuthHeaders()
//     );

//     return response.data.goal;
//   } catch (error) {
//     console.error('Error saving goal to server:', error);
//     throw error; // Re-throw to be handled by the caller
//   }
// };

const AnalyticsPage: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  // Analytics type filter state for the last table
  const [analyticsType, setAnalyticsType] = useState('stock_sold');
  const [period, setPeriod] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'next3Months' | 'day' | '10days' | 'month' | '3months' | 'custom' | 'all' | string>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editGoalDialogOpen, setEditGoalDialogOpen] = useState(false);
  const [salesTarget, setSalesTarget] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [durationMonths, setDurationMonths] = useState('1');
  let currentGoalMonth = 1;


  // Determine startDate and endDate for the query based on selected period
  const getQueryDateRange = () => {
    let start: Date | null = null;
    let end: Date | null = new Date();
    const now = new Date();
    switch (period) {
      case 'thisMonth': {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      }
      case 'lastMonth': {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case 'last3Months': {
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      }
      case 'next3Months': {
        start = now;
        end = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate(), 23, 59, 59, 999);
        break;
      }
      case 'day': {
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case '10days': {
        start = new Date();
        start.setDate(start.getDate() - 9);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'custom': {
        start = customStartDate;
        end = customEndDate;
        break;
      }
      case 'all':
      default:
        start = null;
        end = null;
        break;
    }
    return { startDate: start, endDate: end };
  };

  const { startDate: queryStartDate, endDate: queryEndDate } = getQueryDateRange();

  // Fetch inventory history for analytics table
  const { data: historyData, isLoading: isLoadingHistory, error: errorHistory } = useQuery<IInventoryHistoryItem[], Error>({
    queryKey: ['inventoryHistory', period, queryStartDate?.toISOString(), queryEndDate?.toISOString()],
    queryFn: async () => {
      let url = `${API_URL}/history?period=${period}`;
      if (period === 'custom' && queryStartDate && queryEndDate) {
        url = `${API_URL}/history?period=custom&startDate=${queryStartDate.toISOString()}&endDate=${queryEndDate.toISOString()}`;
      }
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    },
  });

  const { data: dailyAnalytics, isLoading: isLoadingDaily, error: errorDaily } = useQuery<DailyAnalytics, Error>({
    queryKey: ['dailyAnalytics'],
    queryFn: fetchDailyAnalytics,
  });

  const { data: monthlyAnalytics, isLoading: isLoadingMonthly, error: errorMonthly } = useQuery<MonthlyAnalytics, Error>({
    queryKey: ['monthlyAnalytics'],
    queryFn: fetchMonthlyAnalytics,
  });

  // Replace the goal fetching logic
  const { data: goal, refetch: refetchGoal } = useQuery<IGoal | undefined>({
    queryKey: ['goal'],
    queryFn: async () => {
      const response = await axios.get<{ goal: IGoal }>(GOALS_API_URL, getAuthHeaders());
      return response.data.goal;
    },
    initialData: undefined
  });

  // Fetch history for the entire goal period
  const { data: goalHistoryData, refetch: refetchGoalHistory } = useQuery<IInventoryHistoryItem[], Error>({
    queryKey: ['goalHistory', goal?.startDate],
    queryFn: async () => {
      if (!goal || !goal.startDate) return [];
      const startDate = new Date(goal.startDate);
      startDate.setHours(0, 0, 0, 0); // Start of the day
      const endDate = new Date(goal.deadline);
      endDate.setHours(23, 59, 59, 999); // End of today
      const url = `${API_URL}/history?period=custom&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      const response = await axios.get(url, getAuthHeaders());
      return response.data;
    },
    enabled: !!goal?.startDate,
  });

  useEffect(() => {
    refetchGoalHistory();
  }, [dailyAnalytics, refetchGoalHistory]);

  const { totalSalesForGoal, totalProfitForGoal } = useMemo(() => {
    if (!goalHistoryData) return { totalSalesForGoal: 0, totalProfitForGoal: 0 };

    const sales = goalHistoryData
      .filter(item => item.type === 'reduce')
      .reduce((acc, item) => acc + ((item.priceAtTransaction || 0) * Math.abs(item.changeQuantity)), 0);

    const cost = goalHistoryData
      .filter(item => item.type === 'reduce')
      .reduce((acc, item) => acc + ((item.buyingPriceAtTransaction || 0) * Math.abs(item.changeQuantity)), 0);

    return { totalSalesForGoal: sales, totalProfitForGoal: sales - cost };
  }, [goalHistoryData]);

  const totalGoalSalesPercentage = goal && goal.targetAmount > 0 ? (totalSalesForGoal / goal.targetAmount) * 100 : 5;
  const totalGoalProfitPercentage = goal && goal.targetProfit > 0 ? (totalProfitForGoal / goal.targetProfit) * 100 : 0;


  const perMonthTarget = (goal && goal.durationMonths) ? goal.targetAmount / goal.durationMonths : 0;
  const perMonthProfitTarget = (goal && goal.durationMonths) ? goal.targetProfit / goal.durationMonths : 0;

  const dailySalesTarget = perMonthTarget / 30;
  const dailyProfitTarget = perMonthProfitTarget / 30;

  const dailySales = dailyAnalytics?.totalSellValue || 0;
  const dailyProfit = dailyAnalytics?.dailyProfit || 0;

  const dailySalesPercentage = dailySalesTarget > 0 ? (dailySales / dailySalesTarget) * 100 : 0;
  const dailyProfitPercentage = dailyProfitTarget > 0 ? (dailyProfit / dailyProfitTarget) * 100 : 0;

  // Dialog open logic
  const openSetGoalDialog = () => {
    setSalesTarget('');
    setProfitTarget('');
    setDurationMonths('1');
    setGoalDialogOpen(true);
  };

  const openEditGoalDialog = () => {
    setSalesTarget(goal?.targetAmount?.toString() || '');
    setProfitTarget(goal?.targetProfit?.toString() || '');
    setDurationMonths(goal?.durationMonths?.toString() || '1');
    setEditGoalDialogOpen(true);
  };

  // Save logic

  const handleEditgoal = async () => {
    if (!salesTarget || !profitTarget || !durationMonths) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    const salesTargetNum = Number(salesTarget);
    const profitTargetNum = Number(profitTarget);
    if (isNaN(salesTargetNum) || salesTargetNum <= 0) {
      enqueueSnackbar('Sales target must be a positive number', { variant: 'error' });
      return;
    }
    if (isNaN(profitTargetNum) || profitTargetNum <= 0) {
      enqueueSnackbar('Profit target must be a positive number', { variant: 'error' });
      return;
    }
    try {
      await axios.put(GOALS_API_URL, {
        targetAmount: salesTargetNum,
        targetProfit: profitTargetNum,
        durationMonths: Math.max(1, Math.floor(Number(durationMonths))),
      }, getAuthHeaders());
      refetchGoal();
      setEditGoalDialogOpen(false);
      enqueueSnackbar('Goal saved successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save goal. Please try again.', { variant: 'error' });
    }
  };

  const handleSaveGoals = async () => {
    if (!salesTarget || !profitTarget || !durationMonths) {
      enqueueSnackbar('Please fill in all fields', { variant: 'error' });
      return;
    }
    const salesTargetNum = Number(salesTarget);
    const profitTargetNum = Number(profitTarget);
    if (isNaN(salesTargetNum) || salesTargetNum <= 0) {
      enqueueSnackbar('Sales target must be a positive number', { variant: 'error' });
      return;
    }
    if (isNaN(profitTargetNum) || profitTargetNum <= 0) {
      enqueueSnackbar('Profit target must be a positive number', { variant: 'error' });
      return;
    }
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      const deadline = new Date(startDate);
      deadline.setMonth(deadline.getMonth() + Number(durationMonths));
      deadline.setHours(23, 59, 59, 999);

      await axios.post(GOALS_API_URL, {
        targetAmount: salesTargetNum,
        targetProfit: profitTargetNum,
        durationMonths: Math.max(1, Math.floor(Number(durationMonths))),
        deadline: deadline,
        startDate: startDate
      }, getAuthHeaders());
      refetchGoal();
      setGoalDialogOpen(false);
      enqueueSnackbar('Goal saved successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to save goal. Please try again.', { variant: 'error' });
    }
  };

  // Calculate percentages and progress
  const theme = useTheme();
  let goalDaysLeft = null;
  if (goal && goal.deadline) {
    const now = new Date();
    const deadlineDate = new Date(goal.deadline);
    if (now <= deadlineDate) {
      goalDaysLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      goalDaysLeft = -1; // Goal period has ended
    }
  }

  const handlePeriodChange = (e: MuiSelectChangeEvent) => {
    setPeriod(e.target.value as string);
    if (e.target.value !== 'custom') {
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  };

  if (goal && goal.startDate && goal.durationMonths) {
    const start = new Date(goal.startDate);
    const now = new Date();
    currentGoalMonth = Math.max(1, Math.min(goal.durationMonths, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1));
  }
  // Calculate start and end of current goal month
  let monthStart = null, monthEnd = null, daysLeft = null, totalDays = null;
  if (goal && goal.startDate && goal.durationMonths) {
    const start = new Date(goal.startDate);
    monthStart = new Date(start.getFullYear(), start.getMonth() + currentGoalMonth - 1, 1);
    monthEnd = new Date(start.getFullYear(), start.getMonth() + currentGoalMonth, 0, 23, 59, 59, 999);
    const now = new Date();
    totalDays = monthEnd.getDate();
    if (now < monthEnd && now >= monthStart) {
      daysLeft = Math.floor((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    } else if (now < monthStart) {
      daysLeft = totalDays;
    } else {
      daysLeft = 0;
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      {/* Header with goal */}
      <Box sx={{ mb: 4, p: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.primary.light, borderRadius: '4px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1" sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'inherit' : theme.palette.primary.contrastText }}>
            Inventory Analytics
          </Typography>
          <Box>
            {!goal && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={openSetGoalDialog}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  color: 'white',
                }}
              >
                Set goal
              </Button>
            )}
            {goal && (
              <>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={openSetGoalDialog}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    color: 'white',
                    mr: 2
                  }}
                >
                  Set Goal
                </Button>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={openEditGoalDialog}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    color: 'white'
                  }}
                >
                  Edit goal
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* goal Progress Section */}
      {goal && (
        <Paper elevation={3} sx={{
          p: 3,
          mb: 4,
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
          borderRadius: 4,
          boxShadow: 8,
        }}>
          <Typography variant="h6" gutterBottom color="inherit">
            Your Goal Progress
          </Typography>
          <Grid container spacing={3} alignItems="center">
            {/* Daily Progress (left) */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Today's Targets</Typography>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <MoneyIcon sx={{ fontSize: 30, mb: 1 }} />
                        <CircularProgressWithLabel
                          value={dailySalesPercentage}
                          size={80}
                          thickness={7}
                          color={dailySalesPercentage > 100 ? 'secondary' : 'primary'}
                        >
                          <Typography fontSize={10} fontWeight="bold">
                            {dailySalesPercentage.toFixed(2)}%
                          </Typography>
                        </CircularProgressWithLabel>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Target: NPR {dailySalesTarget.toFixed(0)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <TrendingUpIcon sx={{ fontSize: 30, mb: 1 }} />
                        <CircularProgressWithLabel
                          value={dailyProfitPercentage}
                          size={80}
                          thickness={7}
                          color={dailyProfitPercentage > 100 ? 'secondary' : 'primary'}
                        >
                          <Typography fontSize={10} fontWeight="bold">
                            {dailyProfitPercentage.toFixed(2)}%
                          </Typography>
                        </CircularProgressWithLabel>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Target: NPR {dailyProfitTarget.toFixed(0)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            {/* Total Goal Progress (right) */}
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>Goal Progress ({goal.durationMonths} Months)</Typography>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={6}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <MoneyIcon sx={{ fontSize: 30, mb: 1 }} />
                        <CircularProgressWithLabel
                          value={totalGoalSalesPercentage}
                          size={80}
                          thickness={7}
                          color={totalGoalSalesPercentage > 100 ? 'secondary' : 'primary'}
                        >
                          <Typography fontSize={10} fontWeight="bold">
                            {totalGoalSalesPercentage.toFixed(2)}%
                          </Typography>
                        </CircularProgressWithLabel>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Sales: NPR {goal.targetAmount.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <TrendingUpIcon sx={{ fontSize: 30, mb: 1 }} />
                        <CircularProgressWithLabel
                          value={totalGoalProfitPercentage}
                          size={80}
                          thickness={7}
                          color={totalGoalProfitPercentage > 100 ? 'secondary' : 'primary'}
                        >
                          <Typography fontSize={10} fontWeight="bold">
                            {totalGoalProfitPercentage.toFixed(2)}%
                          </Typography>
                        </CircularProgressWithLabel>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Profit: NPR {goal.targetProfit.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Days left in Goal */}
      {goal && goalDaysLeft !== null && (
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Typography variant="subtitle2" color="text.secondary">
            {goalDaysLeft >= 0
              ? `${goalDaysLeft} day${goalDaysLeft > 1 ? 's' : ''} left to achieve your goal`
              : 'Your goal period has ended'}
          </Typography>
        </Box>
      )}

      {/* Remove the month selector UI */}
      {/* In the Set Goal dialog, use a single row with three fields, clear labels, and helper texts */}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stat Tiles for Today's Performance */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{
            p: 3,
            borderRadius: 4,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #232526 0%, #414345 100%)'
              : 'linear-gradient(120deg, #f8fafc 0%, #e3e6f0 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1, color: 'primary.main', mb: 2 }}>Today's Performance</Typography>
            {isLoadingDaily ? (
              <CircularProgress size={24} />
            ) : errorDaily ? (
              <Alert severity="error">Error: {errorDaily.message}</Alert>
            ) : dailyAnalytics ? (
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: theme.palette.info.light, width: 40, height: 40, mb: 1 }}>
                      <ShoppingCartIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Buy Value</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="info.main">NPR {dailyAnalytics.totalBuyValue.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40, mb: 1 }}>
                      <MonetizationOnIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Sell Value</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">NPR {dailyAnalytics.totalSellValue.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: dailyAnalytics.dailyProfit >= 0 ? theme.palette.success.light : theme.palette.error.light, width: 40, height: 40, mb: 1 }}>
                      <ProfitIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Profit</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color={dailyAnalytics.dailyProfit >= 0 ? 'success.main' : 'error.main'}>
                      NPR {dailyAnalytics.dailyProfit.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : null}
          </Paper>
        </Grid>

        {/* Monthly Analytics as Stat Tiles */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{
            p: 3,
            borderRadius: 4,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(120deg, #232526 0%, #414345 100%)'
              : 'linear-gradient(120deg, #f8fafc 0%, #e3e6f0 100%)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, letterSpacing: 1, color: 'secondary.main', mb: 2 }}>1 Month Performance</Typography>
            {isLoadingMonthly ? (
              <CircularProgress size={24} />
            ) : errorMonthly ? (
              <Alert severity="error">Error: {errorMonthly.message}</Alert>
            ) : monthlyAnalytics ? (
              <Grid container spacing={2} justifyContent="center" alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: theme.palette.info.light, width: 40, height: 40, mb: 1 }}>
                      <ShoppingCartIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Buy Value</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="info.main">NPR {monthlyAnalytics.totalBuyValue.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40, mb: 1 }}>
                      <MonetizationOnIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Sell Value</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">NPR {monthlyAnalytics.totalSellValue.toFixed(2)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box display="flex" flexDirection="column" alignItems="center" p={1}>
                    <Avatar sx={{ bgcolor: monthlyAnalytics.monthlyProfit >= 0 ? theme.palette.success.light : theme.palette.error.light, width: 40, height: 40, mb: 1 }}>
                      <ProfitIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="caption" color="textSecondary">Profit</Typography>
                    <Typography variant="subtitle1" fontWeight={700} color={monthlyAnalytics.monthlyProfit >= 0 ? 'success.main' : 'error.main'}>
                      NPR {monthlyAnalytics.monthlyProfit.toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : null}
          </Paper>
        </Grid>
      </Grid>


      {/* Analytics Type Filter and Dynamic Table (last section) */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {ANALYTICS_TYPES.find(t => t.value === analyticsType)?.label || 'Analytics'}
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Analytics Type</InputLabel>
                  <Select
                    value={analyticsType}
                    label="Analytics Type"
                    onChange={(e: MuiSelectChangeEvent) => setAnalyticsType(e.target.value as string)}
                  >
                    {ANALYTICS_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={period}
                    onChange={handlePeriodChange}
                    label="Period"
                  >
                    <MenuItem value="last3Months">Last 3 Months</MenuItem>
                    <MenuItem value="lastMonth">Last Month</MenuItem>
                    <MenuItem value="10days">Last 10 Days</MenuItem>
                    <MenuItem value="day">Today</MenuItem>
                    <MenuItem value="thisMonth">This Month</MenuItem>
                    <MenuItem value="custom">Custom Date Range</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
                {period === 'custom' && (
                  <>
                    <DatePicker
                      label="Start Date"
                      value={customStartDate}
                      onChange={setCustomStartDate}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={customEndDate}
                      onChange={setCustomEndDate}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </>
                )}
              </Box>
            </Box>
            {/* Dynamic analytics table rendering */}
            {/* Real data table rendering */}
            {isLoadingHistory ? (
              <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>
            ) : errorHistory ? (
              <Alert severity="error">{errorHistory.message}</Alert>
            ) : historyData && historyData.length > 0 ? (
              (() => {
                let columns: { label: string; key: string }[] = [];
                let rows: any[] = [];
                let footerContent: React.ReactNode = null;

                switch (analyticsType) {
                  case 'stock_added':
                    columns = [
                      { label: 'Product Name', key: 'productName' },
                      { label: 'Quantity Added', key: 'quantity' },
                      { label: 'Buy Value', key: 'buyValue' },
                      { label: 'Date', key: 'date' },
                    ];
                    rows = historyData.filter(r => r.type === 'add').map(r => ({
                      productName: r.productName,
                      quantity: r.changeQuantity,
                      buyValue: `NPR ${((r.buyingPriceAtTransaction || 0) * r.changeQuantity).toFixed(2)}`,
                      date: new Date(r.timestamp).toLocaleString(),
                    }));
                    const totalQuantityAdded = historyData.filter(r => r.type === 'add').reduce((acc, r) => acc + r.changeQuantity, 0);
                    const totalBuyValueAdded = historyData.filter(r => r.type === 'add').reduce((acc, r) => acc + ((r.buyingPriceAtTransaction || 0) * r.changeQuantity), 0);
                    footerContent = (
                      <TableRow>
                        <TableCell colSpan={1} />
                        <TableCell align="center">Total Quantity: {totalQuantityAdded}</TableCell>
                        <TableCell align="center">Total Buy Value: NPR {totalBuyValueAdded.toFixed(2)}</TableCell>
                        <TableCell colSpan={1} />
                      </TableRow>
                    );
                    break;
                  case 'stock_edited':
                    columns = [
                      { label: 'Product Name', key: 'productName' },
                      { label: 'Current Stock', key: 'stock' },
                      { label: 'Buy Value', key: 'buyValue' },
                      { label: 'Sell Value', key: 'sellValue' },
                      { label: 'Date', key: 'date' },
                    ];
                    rows = historyData.filter(r => r.type === 'edit_item').map(r => ({
                      productName: r.productName,
                      stock: r.currentQuantity,
                      buyValue: r.buyingPriceAtTransaction ? `NPR ${r.buyingPriceAtTransaction.toFixed(2)}` : 'N/A',
                      sellValue: r.priceAtTransaction ? `NPR ${r.priceAtTransaction.toFixed(2)}` : 'N/A',
                      date: new Date(r.timestamp).toLocaleString(),
                    }));
                    break;
                  case 'stock_sold':
                    columns = [
                      { label: 'Product Name', key: 'productName' },
                      { label: 'Sold Quantity', key: 'quantity' },
                      { label: 'Sell Value', key: 'sellValue' },
                      { label: 'Buy Value', key: 'buyValue' },
                      { label: 'Profit', key: 'profit' },
                      { label: 'Date', key: 'date' },
                    ];
                    rows = historyData.filter(r => r.type === 'reduce').map(r => {
                      const quantity = Math.abs(r.changeQuantity);
                      const sellValue = (r.priceAtTransaction || 0) * quantity;
                      const buyValue = (r.buyingPriceAtTransaction || 0) * quantity;
                      const profit = sellValue - buyValue;
                      return {
                        productName: r.productName,
                        quantity: quantity,
                        sellValue: `NPR ${sellValue.toFixed(2)}`,
                        buyValue: `NPR ${buyValue.toFixed(2)}`,
                        profit: `NPR ${profit.toFixed(2)}`,
                        date: new Date(r.timestamp).toLocaleString(),
                      };
                    });
                    const totalQuantitySold = historyData.filter(r => r.type === 'reduce').reduce((acc, r) => acc + Math.abs(r.changeQuantity), 0);
                    const totalSellValue = historyData.filter(r => r.type === 'reduce').reduce((acc, r) => acc + ((r.priceAtTransaction || 0) * Math.abs(r.changeQuantity)), 0);
                    const totalBuyValueSold = historyData.filter(r => r.type === 'reduce').reduce((acc, r) => acc + ((r.buyingPriceAtTransaction || 0) * Math.abs(r.changeQuantity)), 0);
                    const totalProfit = totalSellValue - totalBuyValueSold;
                    footerContent = (
                      <TableRow>
                        <TableCell />
                        <TableCell align="center">Total: {totalQuantitySold}</TableCell>
                        <TableCell align="center">NPR {totalSellValue.toFixed(2)}</TableCell>
                        <TableCell align="center">NPR {totalBuyValueSold.toFixed(2)}</TableCell>
                        <TableCell align="center">NPR {totalProfit.toFixed(2)}</TableCell>
                        <TableCell />
                      </TableRow>
                    );
                    break;
                  case 'new_item':
                    columns = [
                      { label: 'Product Name', key: 'productName' },
                      { label: 'Initial Stock', key: 'stock' },
                      { label: 'Initial Buy Value', key: 'buyValue' },
                      { label: 'Date', key: 'date' },
                    ];
                    rows = historyData.filter(r => r.type === 'new_item').map(r => ({
                      productName: r.productName,
                      stock: r.changeQuantity,
                      buyValue: `NPR ${((r.buyingPriceAtTransaction || 0) * r.changeQuantity).toFixed(2)}`,
                      date: new Date(r.timestamp).toLocaleString(),
                    }));
                    const totalInitialStock = historyData.filter(r => r.type === 'new_item').reduce((acc, r) => acc + r.changeQuantity, 0);
                    const totalInitialBuyValue = historyData.filter(r => r.type === 'new_item').reduce((acc, r) => acc + ((r.buyingPriceAtTransaction || 0) * r.changeQuantity), 0);
                    footerContent = (
                      <TableRow>
                        <TableCell colSpan={1} />
                        <TableCell align="center">Total Stock: {totalInitialStock}</TableCell>
                        <TableCell align="center">Total Buy Value: NPR {totalInitialBuyValue.toFixed(2)}</TableCell>
                        <TableCell colSpan={1} />
                      </TableRow>
                    );
                    break;
                  case 'item_deleted':
                    columns = [
                      { label: 'Product Name', key: 'productName' },
                      { label: 'Stock at Deletion', key: 'stock' },
                      { label: 'Buy Value at Deletion', key: 'buyValue' },
                      { label: 'Date', key: 'date' },
                    ];
                    rows = historyData.filter(r => r.type === 'delete_item').map(r => ({
                      productName: r.productName,
                      stock: Math.abs(r.changeQuantity),
                      buyValue: `NPR ${((r.buyingPriceAtTransaction || 0) * Math.abs(r.changeQuantity)).toFixed(2)}`,
                      date: new Date(r.timestamp).toLocaleString(),
                    }));
                    const totalDeletedStock = historyData.filter(r => r.type === 'delete_item').reduce((acc, r) => acc + Math.abs(r.changeQuantity), 0);
                    const totalDeletedBuyValue = historyData.filter(r => r.type === 'delete_item').reduce((acc, r) => acc + ((r.buyingPriceAtTransaction || 0) * Math.abs(r.changeQuantity)), 0);
                    footerContent = (
                      <TableRow>
                        <TableCell colSpan={1} />
                        <TableCell align="center">Total Stock: {totalDeletedStock}</TableCell>
                        <TableCell align="center">Total Buy Value: NPR {totalDeletedBuyValue.toFixed(2)}</TableCell>
                        <TableCell colSpan={1} />
                      </TableRow>
                    );
                    break;
                  default:
                    break;
                }
                return (
                  <TableContainer sx={{ overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {columns.map(col => (
                            <TableCell key={col.key} align="center">{col.label}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, idx) => (
                          <TableRow key={idx}>
                            {columns.map(col => (
                              <TableCell key={col.key} align="center">{row[col.key]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                      <TableFooter sx={{ position: 'sticky', bottom: 0, backgroundColor: theme.palette.background.paper }}>
                        {footerContent}
                      </TableFooter>
                    </Table>
                  </TableContainer>
                );
              })()
            ) : (
              <Typography align="center" sx={{ my: 2 }}>No data found for this period and filter.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Goal Setting Dialog */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="sm" fullWidth>
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
                />
                <TextField
                  fullWidth
                  label="Monthly Profit Target (NPR)"
                  type="number"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(e.target.value)}
                  sx={{ mb: 3 }}
                  helperText="Your target profit for the duration"
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
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveGoals}
            variant="contained"
            disabled={!salesTarget || !profitTarget || !durationMonths}
          >
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editGoalDialogOpen} onClose={() => setEditGoalDialogOpen(false)} maxWidth="sm" fullWidth>
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
                />
                <TextField
                  fullWidth
                  label="Monthly Profit Target (NPR)"
                  type="number"
                  value={profitTarget}
                  onChange={(e) => setProfitTarget(e.target.value)}
                  sx={{ mb: 3 }}
                  helperText="Your target profit for the duration"
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
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGoalDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditgoal}
            variant="contained"
            disabled={!salesTarget || !profitTarget || !durationMonths}
          >
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};
export default AnalyticsPage;