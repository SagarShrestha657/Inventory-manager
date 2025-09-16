import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CardHeader,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Inventory as ProductIcon,
  Home as HomeIcon,
  Book as BookIcon,
  Headphones as HeadphonesIcon,
  Kitchen as KitchenIcon,
  Devices as DevicesIcon,
  MoreHoriz as MoreHorizIcon,
  LocalGroceryStore as GroceryIcon,
  SportsSoccer as SportsIcon,
  Pets as PetsIcon,
  LocalCafe as CafeIcon,
  LocalFlorist as FloristIcon,
  EmojiObjects as LightIcon,
  LocalLibrary as LibraryIcon,
  LocalPharmacy as PharmacyIcon,
  Toys as ToysIcon,
  Lightbulb as LightbulbIcon,
  Checkroom as ClothesIcon,
  Watch as WatchIcon,
  PhoneIphone as PhoneIcon,
  LaptopMac as LaptopIcon,
  Tv as TvIcon,
  Iron as IronIcon,
  Chair as ChairIcon,
  Visibility as VisibilityIcon,
  AddShoppingCart as AddShoppingCartIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryService from '../services/categoryService';
import * as inventoryService from '../services/inventoryService';
import type { ICategory } from '../services/categoryService';
import type { IInventoryItem } from '../services/inventoryService';

// Import Modals
import EditProductModal from '../components/inventory/EditProductModal';
import ViewProductModal from '../components/inventory/ViewProductModal';
import AdjustStockModal from '../components/inventory/AdjustStockModal';
import useAuthStore from '../store/authStore';

const Categories: React.FC = () => {
  // State for categories
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('CategoryIcon');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  // State for products within a category
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IInventoryItem | null>(null);
  const [adjustStockType, setAdjustStockType] = useState<'add' | 'reduce' | null>(null);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IInventoryItem | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const queryClient = useQueryClient();
  const { userId } = useAuthStore(); // Get userId from auth store

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories, error: errorCategories } = useQuery({
    queryKey: ['categories', userId],
    queryFn: categoryService.getCategories,
    enabled: !!userId,
  });

  const { data: inventories = [] } = useQuery({
    queryKey: ['inventories', userId],
    queryFn: inventoryService.getInventory,
    enabled: !!userId,
  });

  // Mutations for Categories
  const createCategoryMutation = useMutation({
    mutationFn: (newData: Omit<ICategory, '_id' | 'createdAt' | 'updatedAt'>) => categoryService.createCategory(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error creating category', severity: 'error' });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICategory> }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating category', severity: 'error' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting category', severity: 'error' });
    },
  });

  // Mutations for Products
  const deleteProductMutation = useMutation({ 
    mutationFn: inventoryService.deleteItem, 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
    },
    onError: (error: any) => {
        setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting product', severity: 'error' });
    }
  });

  // Handlers for Categories
  const handleOpenDialog = (category?: ICategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryDescription(category.description || '');
      setCategoryIcon(category.icon || 'CategoryIcon');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      setCategoryIcon('CategoryIcon');
    }
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
  };
  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      setSnackbar({ open: true, message: 'Category name is required', severity: 'error' });
      return;
    }

    if (editingCategory) {
      const updateData = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        icon: categoryIcon,
      };
      updateCategoryMutation.mutate({ id: editingCategory._id, data: updateData });
    } else {
      if (!userId) {
        setSnackbar({ open: true, message: 'You must be logged in to create a category.', severity: 'error' });
        return;
      }
      const newCategoryData = { 
        name: categoryName.trim(), 
        description: categoryDescription.trim(),
        icon: categoryIcon,
        productCount: 0,
        userId: userId,
      };
      createCategoryMutation.mutate(newCategoryData);
    }
  };
  const handleDeleteCategory = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId);
    setDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };
  const handleOpenDeleteCategoryDialog = (category: ICategory) => {
    setCategoryToDelete(category);
    setDeleteCategoryDialogOpen(true);
  };
  const handleCloseDeleteCategoryDialog = () => {
    setDeleteCategoryDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Handlers for Products
  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ['inventories'] });
    setSnackbar({ open: true, message, severity: 'success' });
  };
  const handleError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };
  const handleViewProduct = (product: IInventoryItem) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };
  const handleEditProduct = (product: IInventoryItem) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };
  const handleAdjustStockOpen = (type: 'add' | 'reduce', product: IInventoryItem) => {
    setAdjustStockType(type);
    setSelectedProduct(product);
    setIsAdjustStockModalOpen(true);
  };
  const handleDeleteProduct = (product: IInventoryItem) => {
    setProductToDelete(product);
    setDeleteProductDialogOpen(true);
  };
  const handleConfirmProductDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id!);
    }
    setDeleteProductDialogOpen(false);
    setProductToDelete(null);
  };

  // Calculations & Filtering
  const categoryProductCounts: Record<string, number> = {};
  let totalProducts = 0;
  inventories.forEach((item: IInventoryItem) => {
    if (item.category) {
      categoryProductCounts[item.category] = (categoryProductCounts[item.category] || 0) + 1;
      totalProducts++;
    }
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(categorySearchTerm.toLowerCase()))
  );
  
  // Icon Renderer
  const getCategoryIcon = (category: ICategory) => {
    const iconProps = { sx: { color: category.color || 'primary.main', mr: 2, fontSize: 28 } };
    const icons: { [key: string]: React.ReactElement } = {
        HomeIcon: <HomeIcon {...iconProps} />, BookIcon: <BookIcon {...iconProps} />, HeadphonesIcon: <HeadphonesIcon {...iconProps} />, KitchenIcon: <KitchenIcon {...iconProps} />, DevicesIcon: <DevicesIcon {...iconProps} />, GroceryIcon: <GroceryIcon {...iconProps} />, SportsIcon: <SportsIcon {...iconProps} />, PetsIcon: <PetsIcon {...iconProps} />, CafeIcon: <CafeIcon {...iconProps} />, FloristIcon: <FloristIcon {...iconProps} />, LightIcon: <LightIcon {...iconProps} />, LibraryIcon: <LibraryIcon {...iconProps} />, PharmacyIcon: <PharmacyIcon {...iconProps} />, ToysIcon: <ToysIcon {...iconProps} />, MoreHorizIcon: <MoreHorizIcon {...iconProps} />, LightbulbIcon: <LightbulbIcon {...iconProps} />, ClothesIcon: <ClothesIcon {...iconProps} />, WatchIcon: <WatchIcon {...iconProps} />, PhoneIcon: <PhoneIcon {...iconProps} />, LaptopIcon: <LaptopIcon {...iconProps} />, TvIcon: <TvIcon {...iconProps} />, IronIcon: <IronIcon {...iconProps} />, ChairIcon: <ChairIcon {...iconProps} />,
    };
    return icons[category.icon || ''] || <CategoryIcon {...iconProps} />;
  };

  // Main Render Logic
  const renderContent = () => {
    if (selectedCategory) {
      const productsInCategory = inventories.filter(item => item.category === selectedCategory.name);
      const filteredProducts = productsInCategory.filter(product =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
      );

      return (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button variant="outlined" onClick={() => { setSelectedCategory(null); setProductSearchTerm(''); }}>
              Back to Categories
            </Button>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search products..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
            />
          </Box>
          <Typography variant="h5" gutterBottom>
            Products in "{selectedCategory.name}"
          </Typography>
          <Paper>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Buying Price</TableCell>
                    <TableCell>Selling Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map(item => (
                    <TableRow key={item._id} hover>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.buyingPrice}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View"><IconButton size="small" onClick={() => handleViewProduct(item)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleEditProduct(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Add Stock"><IconButton size="small" color="success" onClick={() => handleAdjustStockOpen('add', item)}><AddShoppingCartIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Sell Stock"><IconButton size="small" color="warning" onClick={() => handleAdjustStockOpen('reduce', item)}><RemoveShoppingCartIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteProduct(item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      );
    }

    return (
      <Paper>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Categories List</Typography>
            <TextField
                variant="outlined"
                size="small"
                placeholder="Search categories..."
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} /> }}
            />
        </Box>
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>Category</TableCell><TableCell>Description</TableCell><TableCell>Products</TableCell><TableCell align="center">Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {filteredCategories.map((category) => {
                const count = categoryProductCounts[category.name] || 0;
                return (
                  <TableRow key={category._id} hover>
                    <TableCell><Box display="flex" alignItems="center">{getCategoryIcon(category)}<Typography variant="body1" fontWeight="medium">{category.name}</Typography></Box></TableCell>
                    <TableCell sx={{ maxWidth: 250, wordBreak: 'break-word' }}>
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Products"><span><IconButton size="small" onClick={() => setSelectedCategory(category)} disabled={count === 0}><VisibilityIcon fontSize="small" /></IconButton></span></Tooltip>
                      <Tooltip title="Edit Category"><IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleOpenDialog(category); }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete Category"><span><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleOpenDeleteCategoryDialog(category); }} disabled={count > 0}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box><Typography variant="h4" gutterBottom>Categories Management</Typography><Typography variant="body1" color="textSecondary">Organize your inventory with custom categories</Typography></Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} size="large">Add Category</Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center' }}><CategoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} /><Typography variant="h4" fontWeight="bold" color="primary">{filteredCategories.length}</Typography><Typography variant="body2" color="textSecondary">Total Categories</Typography></Paper></Grid>
        <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 3, textAlign: 'center' }}><ProductIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} /><Typography variant="h4" fontWeight="bold" color="secondary">{totalProducts}</Typography><Typography variant="body2" color="textSecondary">Total Products</Typography></Paper></Grid>
      </Grid>

      {/* Content */}
      {isLoadingCategories && <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>}
      {errorCategories && <Alert severity="error" sx={{ mb: 4 }}>Error loading categories: {errorCategories instanceof Error ? errorCategories.message : 'Unknown error'}</Alert>}
      {!isLoadingCategories && !errorCategories && categories.length > 0 && renderContent()}
      {!isLoadingCategories && !errorCategories && categories.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}><CategoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} /><Typography variant="h6" gutterBottom>No categories yet</Typography><Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>Create your first category to start organizing your inventory</Typography><Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Create Category</Button></Paper>
      )}

      {/* Dialogs and Modals */}
      <Dialog open={deleteCategoryDialogOpen} onClose={handleCloseDeleteCategoryDialog}><DialogTitle>Delete Category</DialogTitle><DialogContent><Typography>Are you sure you want to delete the category "{categoryToDelete?.name}"?</Typography></DialogContent><DialogActions><Button onClick={handleCloseDeleteCategoryDialog}>Cancel</Button><Button onClick={() => handleDeleteCategory(categoryToDelete?._id!)} color="error" variant="contained" disabled={deleteCategoryMutation.isPending}>{deleteCategoryMutation.isPending ? 'Deleting...' : 'Delete'}</Button></DialogActions></Dialog>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth><DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle><DialogContent><Box sx={{ pt: 2 }}><TextField fullWidth label="Category Name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} sx={{ mb: 3 }} helperText="Enter a unique name for this category" required /><TextField fullWidth label="Description" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} multiline rows={3} helperText="Optional description for this category" sx={{ mb: 3 }} /><Box sx={{ mb: 2 }}><Typography variant="subtitle1" sx={{ mb: 1 }}>Select Icon</Typography><Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}><IconButton color={categoryIcon === 'CategoryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('CategoryIcon')}><CategoryIcon /></IconButton><IconButton color={categoryIcon === 'HomeIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('HomeIcon')}><HomeIcon /></IconButton><IconButton color={categoryIcon === 'BookIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('BookIcon')}><BookIcon /></IconButton><IconButton color={categoryIcon === 'HeadphonesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('HeadphonesIcon')}><HeadphonesIcon /></IconButton><IconButton color={categoryIcon === 'KitchenIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('KitchenIcon')}><KitchenIcon /></IconButton><IconButton color={categoryIcon === 'DevicesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('DevicesIcon')}><DevicesIcon /></IconButton><IconButton color={categoryIcon === 'GroceryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('GroceryIcon')}><GroceryIcon /></IconButton><IconButton color={categoryIcon === 'SportsIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('SportsIcon')}><SportsIcon /></IconButton><IconButton color={categoryIcon === 'PetsIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PetsIcon')}><PetsIcon /></IconButton><IconButton color={categoryIcon === 'CafeIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('CafeIcon')}><CafeIcon /></IconButton><IconButton color={categoryIcon === 'FloristIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('FloristIcon')}><FloristIcon /></IconButton><IconButton color={categoryIcon === 'LightIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LightIcon')}><LightIcon /></IconButton><IconButton color={categoryIcon === 'LibraryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LibraryIcon')}><LibraryIcon /></IconButton><IconButton color={categoryIcon === 'PharmacyIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PharmacyIcon')}><PharmacyIcon /></IconButton><IconButton color={categoryIcon === 'ToysIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ToysIcon')}><ToysIcon /></IconButton><IconButton color={categoryIcon === 'MoreHorizIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('MoreHorizIcon')}><MoreHorizIcon /></IconButton><IconButton color={categoryIcon === 'LightbulbIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LightbulbIcon')}><LightbulbIcon /></IconButton><IconButton color={categoryIcon === 'ClothesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ClothesIcon')}><ClothesIcon /></IconButton><IconButton color={categoryIcon === 'WatchIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('WatchIcon')}><WatchIcon /></IconButton><IconButton color={categoryIcon === 'PhoneIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PhoneIcon')}><PhoneIcon /></IconButton><IconButton color={categoryIcon === 'LaptopIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LaptopIcon')}><LaptopIcon /></IconButton><IconButton color={categoryIcon === 'TvIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('TvIcon')}><TvIcon /></IconButton><IconButton color={categoryIcon === 'IronIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('IronIcon')}><IronIcon /></IconButton><IconButton color={categoryIcon === 'ChairIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ChairIcon')}><ChairIcon /></IconButton></Box></Box></Box></DialogContent><DialogActions><Button onClick={handleCloseDialog}>Cancel</Button><Button onClick={handleSaveCategory} variant="contained" disabled={!categoryName.trim() || createCategoryMutation.isPending || updateCategoryMutation.isPending}>{createCategoryMutation.isPending || updateCategoryMutation.isPending ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</Button></DialogActions></Dialog>
      <Dialog open={deleteProductDialogOpen} onClose={() => setDeleteProductDialogOpen(false)}><CardHeader title="Confirm Delete" /><CardContent><Typography>Are you sure you want to delete the product {productToDelete ? ` "${productToDelete.name}"` : ''}?</Typography></CardContent><Box display="flex" justifyContent="flex-end" gap={1} p={2}><Button onClick={() => setDeleteProductDialogOpen(false)} color="secondary" variant="outlined">Cancel</Button><Button onClick={handleConfirmProductDelete} color="error" variant="contained">Delete</Button></Box></Dialog>
      <ViewProductModal open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} product={selectedProduct} />
      <EditProductModal open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSuccess={handleSuccess} onError={handleError} />
      <AdjustStockModal open={isAdjustStockModalOpen} onClose={() => setIsAdjustStockModalOpen(false)} product={selectedProduct} type={adjustStockType} onSuccess={handleSuccess} onError={handleError} />

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;
