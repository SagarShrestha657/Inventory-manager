import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  Snackbar, // Import Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AddShoppingCart as AddShoppingCartIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventory, deleteItem } from '../services/inventoryService';
import AddProductModal from '../components/inventory/AddProductModal';
import EditProductModal from '../components/inventory/EditProductModal';
import ViewProductModal from '../components/inventory/ViewProductModal';
import AdjustStockModal from '../components/inventory/AdjustStockModal';
import type { IInventoryItem } from '../services/inventoryService';

const statusMap = {
  in_stock: { label: 'In Stock', color: 'success' as const },
  low_stock: { label: 'Low Stock', color: 'warning' as const },
  out_of_stock: { label: 'Out of Stock', color: 'error' as const },
};

const Products: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IInventoryItem | null>(null);
  const [adjustStockType, setAdjustStockType] = useState<'add' | 'reduce' | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IInventoryItem | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const queryClient = useQueryClient();

  const { data: products, isLoading, error } = useQuery<IInventoryItem[], Error>({ queryKey: ['products'], queryFn: getInventory });

  const deleteProductMutation = useMutation({ 
    mutationFn: deleteItem, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Error deleting product', severity: 'error' });
    }
  });

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const handleError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewProduct = (product: IInventoryItem) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: IInventoryItem) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (product: IInventoryItem) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id!);
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleAdjustStockOpen = (type: 'add' | 'reduce', product: IInventoryItem) => {
    setAdjustStockType(type);
    setSelectedProduct(product);
    setIsAdjustStockModalOpen(true);
  };

  const filteredProducts = products?.filter((product) =>
    Object.values(product).some(
      (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredProducts.length) : 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setIsAddModalOpen(true)}>
          Add Product
        </Button>
      </Box>

      <Card>
        <CardHeader
          title="Product List"
          action={
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search products..."
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          }
        />
        <Divider />
        <CardContent>
          {isLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>}
          {error && <Alert severity="error" sx={{ my: 2 }}>{error.message}</Alert>}
          {!isLoading && !error && (
            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: '50vh', overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Product Name</TableCell>
                    <TableCell align="center">SKU</TableCell>
                    <TableCell align="center">Category</TableCell>
                    <TableCell align="center">Selling Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0 ? filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : filteredProducts)
                  .map((product) => {
                    const stockStatus = product.quantity > 10 ? 'in_stock' : product.quantity > 0 ? 'low_stock' : 'out_of_stock';
                    return (
                      <TableRow key={product._id} hover>
                        <TableCell align="center"><Typography variant="body1" fontWeight="medium">{product.name}</Typography></TableCell>
                        <TableCell align="center">{product.sku}</TableCell>
                        <TableCell align="center">{product.category}</TableCell>
                        <TableCell align="center">INR {product.price ? product.price.toFixed(2) : 'N/A'}</TableCell>
                        <TableCell align="center">{product.quantity}</TableCell>
                        <TableCell align="center">
                          <Chip label={statusMap[stockStatus].label} color={statusMap[stockStatus].color} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View"><IconButton size="small" onClick={() => handleViewProduct(product)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEditProduct(product)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Add Stock"><IconButton size="small" color="success" onClick={() => handleAdjustStockOpen('add', product)}><AddShoppingCartIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Sell Stock"><IconButton size="small" color="warning" onClick={() => handleAdjustStockOpen('reduce', product)}><RemoveShoppingCartIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteProduct(product)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={7} /></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <Box display="flex" justifyContent="center" my={2}><Typography variant="body1" color="textSecondary">No products found.</Typography></Box>
          )}
          <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredProducts.length} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        </CardContent>
      </Card>

      {/* Modals & Dialogs */}
      <AddProductModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleSuccess} onError={handleError} />
      <EditProductModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSuccess={handleSuccess} onError={handleError} />
      <ViewProductModal open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} product={selectedProduct} />
      <AdjustStockModal open={isAdjustStockModalOpen} onClose={() => setIsAdjustStockModalOpen(false)} product={selectedProduct} type={adjustStockType} onSuccess={handleSuccess} onError={handleError} />
      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <CardHeader title="Confirm Delete" />
        <CardContent><Typography>Are you sure you want to delete the product {productToDelete ? `"${productToDelete.name}"` : ''}?</Typography></CardContent>
        <Box display="flex" justifyContent="flex-end" gap={1} p={2}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary" variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleteProductMutation.isPending}>Delete</Button>
        </Box>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Products;