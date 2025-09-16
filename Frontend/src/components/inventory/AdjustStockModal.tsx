import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
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
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ open, onClose, product, type, onSuccess, onError }) => {
  const queryClient = useQueryClient();
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [buyingPriceInput, setBuyingPriceInput] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open && product) {
      setChangeAmount(0);
      setErrorMessage(null);
      if (type === 'reduce') {
        setPriceInput(product.price || 0);
        setBuyingPriceInput(0);
      } else if (type === 'add') {
        setBuyingPriceInput(product.buyingPrice || 0);
        setPriceInput(product.price || 0);
      }
    } else if (!open) {
        setChangeAmount(0);
        setPriceInput(0);
        setBuyingPriceInput(0);
        setErrorMessage(null);
    }
  }, [open, product, type]);

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, change, type, price, buyingPrice }: { id: string; change: number; type: 'add' | 'reduce'; price?: number; buyingPrice?: number }) =>
      updateQuantity(id, change, type, price, buyingPrice),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      const successMessage = variables.type === 'add' ? 'Stock added successfully!' : 'Stock sold successfully!';
      onSuccess(successMessage);
      onClose();
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || 'Failed to adjust stock.';
      setErrorMessage(message);
      onError(message);
    },
  });

  const handleSubmit = () => {
    setErrorMessage(null); // Clear previous errors
    if (!product || changeAmount <= 0) {
      setErrorMessage('Please enter a quantity greater than 0.');
      return;
    }
    if (type === 'reduce' && priceInput <= 0) {
      setErrorMessage('Please enter a selling price greater than 0.');
      return;
    }
    if (type === 'add' && buyingPriceInput <= 0) {
      setErrorMessage('Please enter a buying price greater than 0.');
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
            value={changeAmount || ''}
            onChange={(e) => setChangeAmount(Number(e.target.value))}
            inputProps={{ min: 1 }}
          />
          {type === 'reduce' && (
            <TextField
              label="Selling Price"
              type="number"
              fullWidth
              value={priceInput || ''}
              onChange={(e) => setPriceInput(Number(e.target.value))}
              inputProps={{ min: 0 }}
            />
          )}
          {type === 'add' && (
            <TextField
              label="Buying Price"
              type="number"
              fullWidth
              value={buyingPriceInput || ''}
              onChange={(e) => setBuyingPriceInput(Number(e.target.value))}
              inputProps={{ min: 0 }}
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