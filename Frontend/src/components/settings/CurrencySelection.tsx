import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const CurrencySelection: React.FC = () => {
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('currency') || 'INR';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const handleCurrencyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setCurrency(event.target.value as string);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom fontWeight={600}>
        Currency
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="currency-select-label">Select Currency</InputLabel>
        <Select
          labelId="currency-select-label"
          id="currency-select"
          value={currency}
          label="Select Currency"
          onChange={handleCurrencyChange}
        >
          <MenuItem value="INR">INR (Indian Rupee)</MenuItem>
          <MenuItem value="NRP">NPR (Nepalese Rupee)</MenuItem>
          <MenuItem value="USD">USD (United States Dollar)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default CurrencySelection;
