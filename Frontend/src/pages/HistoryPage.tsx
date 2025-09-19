import React, { useState } from 'react';
import API_BASE_URL from '../config';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { Delete as DeleteIcon } from '@mui/icons-material'; // Removed DeleteIcon import
import { useQuery /* Removed useMutation, useQueryClient */ } from '@tanstack/react-query';
import axios from 'axios';
// Removed deleteHistoryRecord, deleteMultipleHistoryRecords, deleteAllHistoryRecords imports
// import { deleteHistoryRecord, deleteMultipleHistoryRecords, deleteAllHistoryRecords } from '../services/inventoryService';

interface IInventoryHistoryItem {
  _id: string;
  productId: string;
  productName: string;
  sku: string;
  changeQuantity: number;
  currentQuantity: number;
  type: 'add' | 'reduce' | 'new_item' | 'delete_item' | 'edit_item'; // Added 'edit_item'
  priceAtTransaction?: number;
  buyingPriceAtTransaction?: number;
  userId: string;
  timestamp: string;
}

const API_URL = `${API_BASE_URL}/inventory`;



const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

// Map frontend period to backend period and handle custom date range for lastMonth and last3Months
const getInventoryHistory = async (period: string, startDate?: Date | null, endDate?: Date | null): Promise<IInventoryHistoryItem[]> => {
  let url = `${API_URL}/history?period=${period}`;
  if (period === 'lastMonth') {
    if (startDate && endDate) {
      url = `${API_URL}/history?period=custom&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      url = `${API_URL}/history?period=custom&startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
    }
  }
  if (period === 'last3Months') {
    let start: Date, end: Date;
    if (startDate && endDate) {
      start = startDate;
      end = endDate;
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }
    url = `${API_URL}/history?period=custom&startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
  }
  if (period === 'custom' && startDate && endDate) {
    url = `${API_URL}/history?period=custom&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
  }
  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};


const HistoryPage: React.FC = () => {
  // Filter state
  const [period, setPeriod] = useState<'thisMonth' | 'lastMonth' | 'last3Months' | 'day' | '10days' | 'month' | 'custom' | 'all' | string>('thisMonth');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

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

  const { data: history, isLoading, error } = useQuery<IInventoryHistoryItem[], Error>({
    queryKey: ['inventoryHistory', period, queryStartDate?.toISOString(), queryEndDate?.toISOString()],
    queryFn: () => getInventoryHistory(period, queryStartDate, queryEndDate),
  });

  // Removed deletion mutations
  // const deleteSingleMutation = useMutation({ ... });
  // const deleteMultipleMutation = useMutation({ ... });
  // const deleteAllMutation = useMutation({ ... });

  // Removed selection and dialog handlers
  // const handleSelectAllClick = ...;
  // const handleClick = ...;
  // const isSelected = ...;
  // const handleOpenDeleteDialog = ...;
  // const handleCloseDeleteDialog = ...;
  // const handleDeleteConfirm = ...;

  const getTypeLabel = (type: IInventoryHistoryItem['type']) => {
    switch (type) {
      case 'add': return { label: 'Stock Added', color: 'success' };
      case 'reduce': return { label: 'Stock Reduced', color: 'warning' };
      case 'new_item': return { label: 'New Item', color: 'primary' };
      case 'delete_item': return { label: 'Item Deleted', color: 'error' };
      case 'edit_item': return { label: 'Item Edited', color: 'info' }; // Added for item detail edits
      default: return { label: type, color: 'default' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with flex: left title, right filter */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" gutterBottom>Inventory History</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              onChange={e => {
                setPeriod(e.target.value);
                if (e.target.value !== 'custom') {
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }
              }}
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
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  // refetch handled by react-query key change
                }}
                disabled={!customStartDate || !customEndDate}
              >Apply</Button>
            </>
          )}
        </Box>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error.message}
        </Alert>
      )}
      {!isLoading && !error && history && history.length > 0 && (
        <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell align="center">Timestamp</TableCell>
                <TableCell align="center">Product Name</TableCell>
                <TableCell align="center">SKU</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Change</TableCell>
                <TableCell align="center">Current Stock</TableCell>
                <TableCell align="center">Buying Price</TableCell>
                <TableCell align="center">Selling Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((record) => {
                const typeInfo = getTypeLabel(record.type);
                return (
                  <TableRow
                    hover
                    key={record._id}
                  >
                    <TableCell component="th" id={`history-record-${record._id}`} scope="row" align="center">
                      {new Date(record.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">{record.productName}</TableCell>
                    <TableCell align="center">{record.sku}</TableCell>
                    <TableCell align="center">
                      <Chip label={typeInfo.label} color={typeInfo.color as any} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">{record.changeQuantity > 0 ? `+${record.changeQuantity}` : record.changeQuantity}</TableCell>
                    <TableCell align="center">{record.currentQuantity}</TableCell>
                    <TableCell align="center">INR {record.buyingPriceAtTransaction?.toFixed(2) || 'N/A'}</TableCell>
                    <TableCell align="center">INR {record.priceAtTransaction?.toFixed(2) || 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {!isLoading && !error && (!history || history.length === 0) && (
        <Box display="flex" justifyContent="center" my={2}>
          <Typography variant="body1" color="textSecondary">
            No inventory history found.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default HistoryPage;
