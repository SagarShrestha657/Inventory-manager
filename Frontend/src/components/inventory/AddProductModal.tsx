import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryService from '../../services/categoryService';
import { createItem, type IInventoryItem } from '../../services/inventoryService';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onSuccess, onError }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Omit<IInventoryItem, '_id' | 'createdAt' | 'updatedAt' | 'status'>>({
    name: '',
    sku: '',
    description: '',
    price: 0,
    buyingPrice: 0,
    quantity: 0,
    category: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    sku: false,
    price: false,
    buyingPrice: false,
    quantity: false,
    category: false,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const addProductMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] }); // Also invalidate inventories for categories page
      onSuccess('Product added successfully!');
      onClose();
    },
    onError: (err: any) => {
      onError(err.response?.data?.message || 'Error adding product');
    },
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: 0,
        buyingPrice: 0,
        quantity: 0,
        category: '',
      });
      setFormErrors({ name: false, sku: false, price: false, buyingPrice: false, quantity: false, category: false });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['price', 'buyingPrice', 'quantity'].includes(name) ? parseFloat(value) || 0 : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleCategoryChange = async (_event: React.SyntheticEvent, newValue: string | null) => {
    setFormData((prev) => ({ ...prev, category: newValue || '' }));
    setFormErrors((prev) => ({ ...prev, category: false }));
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData.name.trim(),
      sku: !formData.sku.trim(),
      price: formData.price <= 0,
      buyingPrice: formData.buyingPrice! <= 0,
      quantity: formData.quantity <= 0,
      category: !formData.category.trim(),
    };
    setFormErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    const categoryName = formData.category.trim();
    const categoryExists = categories.some((cat) => cat.name.toLowerCase() === categoryName.toLowerCase());

    if (categoryName && !categoryExists) {
      try {
        await createCategoryMutation.mutateAsync({ name: categoryName, icon: 'CategoryIcon' });
      } catch (error) {
        onError('Failed to create new category.');
        return;
      }
    }

    addProductMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <TextField name="name" label="Product Name" fullWidth margin="normal" value={formData.name} onChange={handleChange} error={formErrors.name} helperText={formErrors.name && 'Product Name is required'} />
          <TextField name="sku" label="SKU" fullWidth margin="normal" value={formData.sku} onChange={handleChange} error={formErrors.sku} helperText={formErrors.sku && 'SKU is required'} />
          <TextField name="description" label="Description (Optional)" fullWidth margin="normal" multiline rows={3} value={formData.description} onChange={handleChange} />
          <Autocomplete
            freeSolo
            options={categories.map((cat) => cat.name)}
            value={formData.category}
            onChange={handleCategoryChange}
            onInputChange={(_event, newInputValue) => {
              setFormData((prev) => ({ ...prev, category: newInputValue || '' }));
              setFormErrors((prev) => ({ ...prev, category: false }));
            }}
            renderInput={(params) => (
              <TextField {...params} name="category" label="Category" fullWidth margin="normal" error={formErrors.category} helperText={formErrors.category && 'Category is required'} />
            )}
            sx={{ flexGrow: 1, my: 1 }}
            loading={isCategoriesLoading}
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField name="buyingPrice" label="Buying Price" type="number" fullWidth margin="normal" value={formData.buyingPrice || ''} onChange={handleChange} error={formErrors.buyingPrice} helperText={formErrors.buyingPrice && 'Buying Price must be > 0'} inputProps={{ min: 0 }} />
            </Grid>
            <Grid item xs={6}>
              <TextField name="price" label="Selling Price" type="number" fullWidth margin="normal" value={formData.price || ''} onChange={handleChange} error={formErrors.price} helperText={formErrors.price && 'Selling Price must be > 0'} inputProps={{ min: 0 }} />
            </Grid>
          </Grid>
          <TextField name="quantity" label="Initial Stock Quantity" type="number" fullWidth margin="normal" value={formData.quantity || ''} onChange={handleChange} error={formErrors.quantity} helperText={formErrors.quantity && 'Quantity must be > 0'} inputProps={{ min: 0 }} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={addProductMutation.isPending || createCategoryMutation.isPending}>
          {addProductMutation.isPending ? <CircularProgress size={24} /> : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductModal;