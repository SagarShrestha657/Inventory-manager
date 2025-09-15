import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import type { IInventoryItem } from '../../services/inventoryService';

interface ViewProductModalProps {
  open: boolean;
  onClose: () => void;
  product: IInventoryItem | null;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({ open, onClose, product }) => {
  if (!product) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Product Details: {product.name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Product Name:</Typography>
            <Typography variant="body1">{product.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">SKU:</Typography>
            <Typography variant="body1">{product.sku}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Category:</Typography>
            <Typography variant="body1">{product.category}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" color="textSecondary">Description:</Typography>
            <Typography variant="body1">{product.description || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">Quantity:</Typography>
            <Typography variant="body1">{product.quantity}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">Selling Price:</Typography>
            <Typography variant="body1">${product.price.toFixed(2)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">Buying Price:</Typography>
            <Typography variant="body1">${product.buyingPrice?.toFixed(2) || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">Created At:</Typography>
            <Typography variant="body1">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle1" color="textSecondary">Last Updated:</Typography>
            <Typography variant="body1">{product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'N/A'}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewProductModal;
