import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import type { IInventoryItem } from '../../services/inventoryService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { updateItem } from '../../services/inventoryService';
import * as categoryService from '../../services/categoryService';
import axios from 'axios';
import API_BASE_URL from '../../config';
import useAuthStore from '../../store/authStore';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: IInventoryItem | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, product, onSuccess, onError }) => {
  const queryClient = useQueryClient();
  const { userId } = useAuthStore();
  const [formData, setFormData] = useState<IInventoryItem | null>(null);
  const [formErrors, setFormErrors] = useState({ name: false, sku: false, category: false });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories', userId],
    queryFn: categoryService.getCategories,
    enabled: !!userId,
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  useEffect(() => {
    if (open && product) {
      setFormData({ ...product });
      setFormErrors({ name: false, sku: false, category: false });
    } else if (!open) {
      setFormData(null);
    }
  }, [open, product]);

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, productData, oldName, oldSku }: { id: string; productData: IInventoryItem; oldName: string; oldSku: string }) => {
      const capitalize = (s: string) => {
        if (typeof s !== 'string' || !s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
      };

      if (productData.category) {
        const formattedCategoryName = capitalize(productData.category.trim());
        productData.category = formattedCategoryName;

        const categoryExists = categories.some(cat => cat.name.toLowerCase() === formattedCategoryName.toLowerCase());

        if (!categoryExists) {
          if (!userId) throw new Error('User not found, cannot create category');
          await createCategoryMutation.mutateAsync({
            name: formattedCategoryName,
            icon: 'CategoryIcon',
            description: '',
            productCount: 0,
            userId: userId
          });
        }
      }
      
      const updated = await updateItem(id, productData);

      if ((productData.name && productData.name !== oldName) || (productData.sku && productData.sku !== oldSku)) {
        await axios.put(`${API_BASE_URL}/inventory/${id}/update-history`, {
          name: productData.name,
          sku: productData.sku
        }, {
          headers: { 'x-auth-token': localStorage.getItem('token') || '' }
        });
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      onSuccess('Product updated successfully!');
      onClose();
    },
    onError: (err: any) => {
      onError(err.response?.data?.message || err.message || 'Error updating product');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string | null) => {
    setFormData((prev) => (prev ? { ...prev, category: newValue || '' } : null));
    setFormErrors((prev) => ({ ...prev, category: false }));
  };

  const validateForm = () => {
    const newErrors = {
      name: !formData?.name.trim(),
      sku: !formData?.sku.trim(),
      category: !formData?.category.trim(),
    };
    setFormErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = () => {
    if (!validateForm() || !formData?._id) {
      return;
    }
    const { _id, createdAt, updatedAt, ...productDataToSend } = formData;
    updateProductMutation.mutate({
      id: _id,
      productData: productDataToSend as IInventoryItem, // Cast here as we know it's a full item
      oldName: product?.name || '',
      oldSku: product?.sku || ''
    });
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Product: {product?.name}</DialogTitle>
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
              setFormData((prev) => (prev ? { ...prev, category: newInputValue || '' } : null));
              setFormErrors((prev) => ({ ...prev, category: false }));
            }}
            renderInput={(params) => (
              <TextField {...params} name="category" label="Category" fullWidth margin="normal" error={formErrors.category} helperText={formErrors.category && 'Category is required'} />
            )}
            sx={{ flexGrow: 1, my: 1 }}
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