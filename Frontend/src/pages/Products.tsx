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
  CircularProgress, // Import CircularProgress for loading indicator
  Alert, // Import Alert for error messages
  Dialog, // Import Dialog for delete confirmation
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  AddShoppingCart as AddShoppingCartIcon, // For Add Stock
  RemoveShoppingCart as RemoveShoppingCartIcon, // For Sell Stock
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import React Query hooks
import { getInventory, deleteItem } from '../services/inventoryService'; // Import API functions
import AddProductModal from '../components/inventory/AddProductModal'; // Import AddProductModal
import EditProductModal from '../components/inventory/EditProductModal'; // Import EditProductModal
import ViewProductModal from '../components/inventory/ViewProductModal'; // Import ViewProductModal
import AdjustStockModal from '../components/inventory/AdjustStockModal'; // Import new AdjustStockModal
import type { IInventoryItem } from '../services/inventoryService';// Import IInventoryItem

const statusMap = {
  in_stock: { label: 'In Stock', color: 'success' },
  low_stock: { label: 'Low Stock', color: 'warning' },
  out_of_stock: { label: 'Out of Stock', color: 'error' },
};

const Products: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false); // State for adjust stock modal
  const [selectedProduct, setSelectedProduct] = useState<IInventoryItem | null>(null);
  const [adjustStockType, setAdjustStockType] = useState<'add' | 'reduce' | null>(null); // To differentiate add/reduce stock
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IInventoryItem | null>(null);

  const queryClient = useQueryClient();

  // Fetch products using useQuery
  const { data: products, isLoading, error } = useQuery<IInventoryItem[], Error>({ queryKey: ['products'], queryFn: getInventory });

  // Mutations for CRUD operations (removed unused declarations to fix linter warnings)
  const deleteProductMutation = useMutation({ 
    mutationFn: deleteItem, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Removed updateProductMutation and deleteProductMutation declarations here as their states (isPending, error) are not directly consumed in this component.
  // They are handled within the respective modals/functions.

  const handleChangePage = (_event: unknown, newPage: number) => { // Mark event as unused
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAddProductOpen = () => {
    setIsAddModalOpen(true);
  };

  const handleAddProductClose = () => {
    setIsAddModalOpen(false);
    // No need to refetch explicitly, React Query will do it on invalidate
  };

  const handleViewProduct = (productId: string) => {
    const product = products?.find((p) => p._id === productId);
    setSelectedProduct(product || null);
    setIsViewModalOpen(true);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (productId: string) => {
    const product = products?.find((p) => p._id === productId);
    setSelectedProduct(product || null);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    console.log('Edit Modal Close: Current isEditModalOpen state:', isEditModalOpen);
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    console.log('Edit Modal Close: New isEditModalOpen state (after set): ', false);
    // No need to refetch explicitly, React Query will do it on invalidate
  };

  // Open delete dialog
  const handleDeleteProduct = (product: IInventoryItem) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id!);
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleAdjustStockOpen = (type: 'add' | 'reduce', product: IInventoryItem) => {
    setAdjustStockType(type);
    setSelectedProduct(product);
    setIsAdjustStockModalOpen(true);
  };

  const handleAdjustStockClose = () => {
    setIsAdjustStockModalOpen(false);
    setSelectedProduct(null);
    setAdjustStockType(null);
    // React Query will invalidate and refetch on mutation success
  };

  const filteredProducts = products?.filter((product) =>
    Object.values(product).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || []; // Ensure filteredProducts is an array

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredProducts.length)
      : 0;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Products</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProductOpen}
        >
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
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          }
        />
        <Divider />
        <CardContent>
          {isLoading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error.message}
            </Alert>
          )}
          {!isLoading && !error && (
            <TableContainer component={Paper} elevation={0} sx={{
              maxHeight: '50vh',
              overflow: 'auto',
              /* Custom Scrollbar Styles */
              scrollbarWidth: 'thin', /* For Firefox */
              '&::-webkit-scrollbar': {
                width: '8px', /* Width of the scrollbar */
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(66, 165, 245, 0.5)', /* Color of the scrollbar thumb - light blue */
                borderRadius: '10px', /* Roundness of the scrollbar thumb */
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(245, 247, 250, 0.8)', /* Color of the scrollbar track - light blue-grey */
              },
            }}> {/* Make table scrollable */}
              <Table size="small" stickyHeader> {/* Add stickyHeader */}
              <TableHead>
                <TableRow>
                    <TableCell sx={{ minWidth: '180px', pt: 1.0, pb: 1.0 }} align="center">Product Name</TableCell>
                    <TableCell sx={{ minWidth: '120px', pt: 1.0, pb: 1.0 }} align="center">SKU</TableCell>
                    <TableCell sx={{ minWidth: '120px', pt: 1.0, pb: 1.0 }} align="center">Category</TableCell>
                    <TableCell sx={{ minWidth: '150px', pt: 1.0, pb: 1.0 }} align="center">Selling Price</TableCell>
                    <TableCell sx={{ minWidth: '80px', pt: 1.0, pb: 1.0 }} align="center">Stock</TableCell>
                    <TableCell sx={{ minWidth: '120px', pt: 1.0, pb: 1.0 }} align="center">Status</TableCell>
                    <TableCell sx={{ minWidth: '200px', pt: 1.0, pb: 1.0 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(rowsPerPage > 0
                  ? filteredProducts.slice(
                      page * rowsPerPage,
                      page * rowsPerPage + rowsPerPage
                    )
                  : filteredProducts
                ).map((product) => (
                    <TableRow key={product._id} hover>
                      <TableCell align="center">
                        <Typography variant="body1" fontWeight="medium" align="center">
                        {product.name}
                      </Typography>
                    </TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }} align="center">{product.sku}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }} align="center">{product.category}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }} align="center">
                        NPR {product.price ? product.price.toFixed(2) : 'N/A'}
                    </TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }} align="center">{product.quantity}</TableCell>
                      <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }} align="center">
                      <Chip
                          label={product.quantity > 10 ? statusMap.in_stock.label : product.quantity > 0 ? statusMap.low_stock.label : statusMap.out_of_stock.label}
                          color={((product.quantity > 10 ? statusMap.in_stock.color : product.quantity > 0 ? statusMap.low_stock.color : statusMap.out_of_stock.color) as any)} // Explicitly cast to any
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                      <TableCell align="center">
                      <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewProduct(product._id!)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                        <Tooltip title="Edit Product Details">
                          <IconButton size="small" color="primary" onClick={() => handleEditProduct(product._id!)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                        <Tooltip title="Add Stock">
                          <IconButton size="small" color="success" onClick={() => handleAdjustStockOpen('add', product)}>
                            <AddShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sell Stock">
                          <IconButton size="small" color="warning" onClick={() => handleAdjustStockOpen('reduce', product)}>
                            <RemoveShoppingCartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}
          {!isLoading && !error && filteredProducts.length === 0 && (
            <Box display="flex" justifyContent="center" my={2}>
              <Typography variant="body1" color="textSecondary">
                No products found.
              </Typography>
            </Box>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredProducts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Adjust Stock */}
      <AddProductModal open={isAddModalOpen} onClose={handleAddProductClose} onAddSuccess={() => {
        console.log('Add Product Success: Invalidating products query.');
        queryClient.invalidateQueries({ queryKey: ['products'] });
      }} />
      <EditProductModal
        open={isEditModalOpen}
        onClose={handleEditModalClose}
        product={selectedProduct}
        onEditSuccess={() => {
          console.log('Edit Product Success: Invalidating products query.');
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }} // Pass refetch callback
      />
      <ViewProductModal
        open={isViewModalOpen}
        onClose={handleViewModalClose}
        product={selectedProduct}
      />
      <AdjustStockModal
        open={isAdjustStockModalOpen}
        onClose={handleAdjustStockClose}
        product={selectedProduct}
        type={adjustStockType}
        onAdjustStockSuccess={() => {
          console.log('Adjust Stock Success: Invalidating products query.');
          queryClient.invalidateQueries({ queryKey: ['products'] });
        }} // Pass refetch callback
      />
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <CardHeader title="Confirm Delete" />
        <CardContent>
          <Typography>
            Are you sure you want to delete the product
            {productToDelete ? ` "${productToDelete.name}"` : ''}?
          </Typography>
        </CardContent>
        <Box display="flex" justifyContent="flex-end" gap={1} p={2}>
          <Button onClick={handleCancelDelete} color="secondary" variant="outlined">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Products;
