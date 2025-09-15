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
  Autocomplete, // Import Autocomplete
} from '@mui/material';
import useInventoryStore from '../../store/inventoryStore';
import type { InventoryState } from '../../store/inventoryStore';
import type { IInventoryItem } from '../../services/inventoryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryService from '../../services/categoryService';

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onAddSuccess: () => void; // Callback for successful addition
}



const AddProductModal: React.FC<AddProductModalProps> = ({ open, onClose, onAddSuccess }) => {
  const addProduct = useInventoryStore((state: InventoryState) => state.addProduct);
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

  // Fetch categories from backend
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Mutation to create a new category
  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
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
      setFormErrors({
        name: false,
        sku: false,
        price: false,
        buyingPrice: false,
        quantity: false,
        category: false,
      });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'buyingPrice' || name === 'quantity' ? parseFloat(value) : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };


  const handleCategoryChange = async (_event: React.SyntheticEvent<Element, Event>, newValue: string | null) => {
    if (!newValue) {
      setFormData((prev) => ({ ...prev, category: '' }));
      setFormErrors((prev) => ({ ...prev, category: false }));
      return;
    }
    // Check if the category exists in backend
    const exists = categories.some((cat) => cat.name.toLowerCase() === newValue.trim().toLowerCase());
    setFormData((prev) => ({ ...prev, category: newValue }));
    setFormErrors((prev) => ({ ...prev, category: false }));
    if (!exists) {
      // Create new category in backend with default icon and empty description
      await createCategoryMutation.mutateAsync({
        name: newValue.trim(),
        description: '',
        icon: 'CategoryIcon',
      });
    }
  };

  // const handleOpenManageCategories = () => {
  //   setIsManageCategoriesOpen(true);
  // };

  // const handleCloseManageCategories = () => {
  //   setIsManageCategoriesOpen(false);
  // };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData.name.trim()) {
      newErrors.name = true;
      isValid = false;
    }
    if (formData.price <= 0) {
      newErrors.price = true;
      isValid = false;
    }
    if (formData.buyingPrice! <= 0) {
      newErrors.buyingPrice = true;
      isValid = false;
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = true;
      isValid = false;
    }
    if (!formData.category.trim()) {
      newErrors.category = true;
      isValid = false;
    }
    if (!formData.sku.trim()) {
      newErrors.sku = true;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      // Ensure category exists in backend before adding product
      let categoryName = formData.category.trim();
      if (categoryName && !categories.some((cat) => cat.name.toLowerCase() === categoryName.toLowerCase())) {
        await createCategoryMutation.mutateAsync({
          name: categoryName,
          description: '',
          icon: 'CategoryIcon',
        });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
      await addProduct(formData);
      onClose();
      onAddSuccess();
      setFormData({
        name: '',
        description: '',
        price: 0,
        buyingPrice: 0,
        quantity: 0,
        category: '',
        sku: '',
      });
      setFormErrors({
        name: false,
        price: false,
        buyingPrice: false,
        quantity: false,
        category: false,
        sku: false,
      });
    } catch (error) {
      console.error('Error adding product:', error);
      // TODO: Display error to user
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 1 }}>
          <TextField
            name="name"
            label="Product Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            helperText={formErrors.name && 'Product Name is required'}
          />
          <TextField
            name="sku"
            label="SKU"
            fullWidth
            margin="normal"
            value={formData.sku}
            onChange={handleChange}
            error={formErrors.sku}
            helperText={formErrors.sku && 'SKU is required'}
          />
          <TextField
            name="description"
            label="Description (Optional)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
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
                <TextField
                  {...params}
                  name="category"
                  label="Category"
                  fullWidth
                  margin="normal"
                  error={formErrors.category}
                  helperText={formErrors.category && 'Category is required'}
                />
              )}
              sx={{ flexGrow: 1 }}
              loading={isCategoriesLoading}
            />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="buyingPrice"
                label="Buying Price"
                type="number"
                fullWidth
                margin="normal"
                value={formData.buyingPrice === 0 ? '' : formData.buyingPrice} // Display empty string if 0
                onChange={handleChange}
                error={formErrors.buyingPrice}
                helperText={formErrors.buyingPrice && 'Buying Price must be greater than 0'}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="price"
                label="Selling Price"
                type="number"
                fullWidth
                margin="normal"
                value={formData.price === 0 ? '' : formData.price} // Display empty string if 0
                onChange={handleChange}
                error={formErrors.price}
                helperText={formErrors.price && 'Selling Price must be greater than 0'}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
          <TextField
            name="quantity"
            label="Initial Stock Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={formData.quantity === 0 ? '' : formData.quantity} // Display empty string if 0
            onChange={handleChange}
            error={formErrors.quantity}
            helperText={formErrors.quantity && 'Quantity must be greater than 0'}
            inputProps={{ min: 0 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">Add Product</Button>
      </DialogActions>
      {/* No ManageCategoriesDialog, categories are managed in backend */}
    </Dialog>
  );
};

export default AddProductModal;
