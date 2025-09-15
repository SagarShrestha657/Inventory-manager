import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Autocomplete, // Import Autocomplete
  CircularProgress, // Import CircularProgress for loading state
} from '@mui/material';
import type { IInventoryItem } from '../../services/inventoryService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'; // Import React Query hooks
import { updateItem } from '../../services/inventoryService';
import * as categoryService from '../../services/categoryService';
import axios from 'axios';
import API_BASE_URL from '../../config';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: IInventoryItem | null;
  onEditSuccess: () => void; // Callback for successful edit
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, product, onEditSuccess }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<IInventoryItem | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: false,
    sku: false,
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
    if (open && product) {
      setFormData({ ...product });
      setFormErrors({
        name: false,
        sku: false,
        category: false,
      });
    } else if (!open) {
      setFormData(null);
    }
  }, [open, product]);

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData, oldName, oldSku }: { id: string; productData: Partial<IInventoryItem>; oldName: string; oldSku: string }) => {
      // If category is new, create it first
      if (productData.category && !categories.some(cat => cat.name === productData.category)) {
        try {
          await createCategoryMutation.mutateAsync({ name: productData.category, icon: 'CategoryIcon' });
        } catch (e) {}
      }
      // Update product
      const updated = await updateItem(id, productData);
      // If name or sku changed, update all histories for this productId
      if ((productData.name && productData.name !== oldName) || (productData.sku && productData.sku !== oldSku)) {
        try {
          await axios.put(`${API_BASE_URL}/inventory/${id}/update-history`, {
            name: productData.name,
            sku: productData.sku
          }, {
            headers: { 'x-auth-token': localStorage.getItem('token') || '' }
          });
        } catch (e) {}
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onEditSuccess();
      onClose();
    },
    onError: (err: any) => {
      console.error('Error updating product:', err);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as { name: string; value: any };
    setFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [name]: value,
      };
    });
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...formErrors };

    if (!formData?.name.trim()) {
      newErrors.name = true;
      isValid = false;
    }
    if (!formData?.sku.trim()) { // Validate SKU
      newErrors.sku = true;
      isValid = false;
    }
    if (!formData?.category.trim()) {
      newErrors.category = true;
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !formData?._id) {
      return;
    }
    try {
      const { _id, createdAt, updatedAt, ...productDataToSend } = formData;
      await updateProductMutation.mutateAsync({
        id: _id,
        productData: productDataToSend,
        oldName: product?.name || '',
        oldSku: product?.sku || ''
      });
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  if (!formData) return null; // Don't render if no product data

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Product: {formData.name}</DialogTitle>
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
          <Autocomplete // Category Autocomplete
            freeSolo
            options={categories.map((cat) => cat.name)}
            value={formData.category}
            onChange={handleCategoryChange}
            onInputChange={(_event, newInputValue) => {
              setFormData((prev) => {
                if (!prev) return null;
                return { ...prev, category: newInputValue || '' };
              });
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={updateProductMutation.isPending}>
          {updateProductMutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductModal;