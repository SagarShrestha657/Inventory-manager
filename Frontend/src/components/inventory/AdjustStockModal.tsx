import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateQuantity, type IInventoryItem } from '../../services/inventoryService';

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  product: IInventoryItem | null;
  type: 'add' | 'reduce' | null;
  onAdjustStockSuccess: () => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ open, onClose, product, type, onAdjustStockSuccess }) => {
  const queryClient = useQueryClient();
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [buyingPriceInput, setBuyingPriceInput] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setChangeAmount(0);
      setErrorMessage(null);
      // Initialize price inputs based on product and type
      if (type === 'reduce') {
        setPriceInput(product.price || 0);
        setBuyingPriceInput(0); // Clear buying price for reduce
      } else if (type === 'add') {
        setBuyingPriceInput(product.buyingPrice || 0);
        setPriceInput(product.price || 0); // Keep selling price for context if needed
      }
    }
  }, [product, type]);

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, change, type, price, buyingPrice }: { id: string; change: number; type: 'add' | 'reduce'; price?: number; buyingPrice?: number }) =>
      updateQuantity(id, change, type, price, buyingPrice),
    onSuccess: () => {
      onAdjustStockSuccess();
      onClose();
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to adjust stock.');
    },
  });

  const handleSubmit = () => {
    if (!product || changeAmount <= 0) {
      setErrorMessage('Please enter a valid quantity.');
      return;
    }
    if (type === 'reduce' && priceInput <= 0) {
      setErrorMessage('Please enter a valid selling price.');
      return;
    }
    if (type === 'add' && buyingPriceInput <= 0) {
      setErrorMessage('Please enter a valid buying price.');
      return;
    }

    adjustStockMutation.mutate({
      id: product._id!,
      change: changeAmount,
      type: type!,
      price: type === 'reduce' ? priceInput : undefined,
      buyingPrice: type === 'add' ? buyingPriceInput : undefined,
    });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{type === 'add' ? 'Add Stock' : 'Sell Stock'}: {product.name}</DialogTitle>
      <DialogContent>
        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            value={changeAmount === 0 ? '' : changeAmount} // Display empty string if 0
            onChange={(e) => setChangeAmount(Number(e.target.value))}
            inputProps={{ min: 0 }}
            error={changeAmount <= 0 && errorMessage !== null}
            helperText={changeAmount <= 0 && errorMessage !== null ? 'Quantity must be greater than 0' : ''}
          />
          {type === 'reduce' && (
            <TextField
              label="Selling Price"
              type="number"
              fullWidth
              value={priceInput === 0 ? '' : priceInput} // Display empty string if 0
              onChange={(e) => setPriceInput(Number(e.target.value))}
              inputProps={{ min: 0 }}
              error={priceInput <= 0 && errorMessage !== null}
              helperText={priceInput <= 0 && errorMessage !== null ? 'Selling price must be greater than 0' : ''}
            />
          )}
          {type === 'add' && (
            <TextField
              label="Buying Price"
              type="number"
              fullWidth
              value={buyingPriceInput === 0 ? '' : buyingPriceInput} // Display empty string if 0
              onChange={(e) => setBuyingPriceInput(Number(e.target.value))}
              inputProps={{ min: 0 }}
              error={buyingPriceInput <= 0 && errorMessage !== null}
              helperText={buyingPriceInput <= 0 && errorMessage !== null ? 'Buying price must be greater than 0' : ''}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={adjustStockMutation.isPending}>
          {adjustStockMutation.isPending ? <CircularProgress size={24} /> : (type === 'add' ? 'Add Stock' : 'Sell Stock')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdjustStockModal;
