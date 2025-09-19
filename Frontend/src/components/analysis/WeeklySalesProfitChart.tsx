import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import { Box, Typography, IconButton, CircularProgress, Alert, Paper } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { addDays, subDays, startOfWeek, endOfWeek, format } from 'date-fns';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../../config';

const API_URL = `${API_BASE_URL}/inventory`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'x-auth-token': token,
    },
  };
};

const fetchWeeklyAnalytics = async (startDate: Date) => {
  const response = await axios.get(`${API_URL}/analytics/weekly?startDate=${startDate.toISOString()}`, getAuthHeaders());
  return response.data;
};

const formatYAxis = (value: any): string => {
  const tickItem = Number(value);
  if (tickItem >= 1000000) {
    return `${(tickItem / 1000000).toFixed(1)}M`;
  }
  if (tickItem >= 1000) {
    return `${(tickItem / 1000).toFixed(1)}k`;
  }
  return String(tickItem);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <Typography variant="h6" gutterBottom>{label}</Typography>
        <Typography variant="body2" sx={{ color: payload[0].color }}>
          {`Sales: INR ${payload[0].value.toLocaleString()}`}
        </Typography>
        <Typography variant="body2" sx={{ color: payload[1].color }}>
          {`Profit: INR ${payload[1].value.toLocaleString()}`}
        </Typography>
      </Paper>
    );
  }

  return null;
};

const WeeklySalesProfitChart: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);

  const { data, isLoading, error } = useQuery({
    queryKey: ['weeklyAnalytics', weekStart.toISOString()],
    queryFn: () => fetchWeeklyAnalytics(weekStart),
  });

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setCurrentDate(newDate);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = subDays(currentDate, 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addDays(currentDate, 7);
    setCurrentDate(newDate);
  };

  return (
    <Box sx={{ width: '100%', p: 2, '& .recharts-wrapper': { outline: 'none' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePreviousWeek}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Week"
            value={currentDate}
            onChange={handleDateChange}
          />
        </LocalizationProvider>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Alert severity="error">Error fetching data</Alert>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 30,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis 
              tickFormatter={formatYAxis} 
              label={{ value: 'Amount (INR)', angle: -90, position: 'insideLeft', offset: -20, style: { textAnchor: 'middle' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sales" fill="url(#colorSales)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" fill="url(#colorProfit)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default WeeklySalesProfitChart;