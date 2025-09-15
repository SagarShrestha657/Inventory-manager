import React, { useState} from 'react';
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
  Card,
  CardContent,
  CardActions,
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
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as categoryService from '../services/categoryService';
import * as inventoryService from '../services/inventoryService';
import type { ICategory } from '../services/categoryService';
import type { IInventoryItem } from '../services/inventoryService';

const Categories: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('CategoryIcon');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(null);
  const queryClient = useQueryClient();


  // Fetch categories using React Query
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  // Fetch inventories using React Query
  const { data: inventories = [], isLoading: isLoadingInventories, error: errorInventories } = useQuery({
    queryKey: ['inventories'],
    queryFn: inventoryService.getInventory,
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category created successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error creating category', 
        severity: 'error' 
      });
    },
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICategory> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['inventories'] });
      setSnackbar({ open: true, message: 'Category updated successfully', severity: 'success' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error updating category', 
        severity: 'error' 
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
    },
    onError: (error: any) => {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Error deleting category', 
        severity: 'error' 
      });
    },
  });

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
      // Update existing category
      updateMutation.mutate({
        id: editingCategory._id,
        data: {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
          icon: categoryIcon,
        },
      });
    } else {
      // Create new category
      createMutation.mutate({
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        icon: categoryIcon,
      });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteMutation.mutate(categoryId);
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  const handleOpenDeleteDialog = (category: ICategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Calculate product count per category and total
  const categoryProductCounts: Record<string, number> = {};
  let totalProducts = 0;
  inventories.forEach((item: IInventoryItem) => {
    if (item.category) {
      categoryProductCounts[item.category] = (categoryProductCounts[item.category] || 0) + 1;
      totalProducts++;
    }
  });

  return (
    <Box>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Categories Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Organize your inventory with custom categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Add Category
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="primary">
              {categories.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Categories
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <ProductIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" color="secondary">
              {totalProducts}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total Products
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Loading State */}
      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          Error loading categories: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {/* Categories Grid or Products Table */}
      {(() => {
        const [selectedCategory, setSelectedCategory] = React.useState<ICategory | null>(null);
        // This is a hack to keep the state in the right scope for this patch. Move to top-level if integrating.
        if (selectedCategory) {
          const filteredProducts = inventories.filter(item => item.category === selectedCategory.name);
          return (
            <Box>
              <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setSelectedCategory(null)}>
                Back to Categories
              </Button>
              <Typography variant="h5" gutterBottom>
                Products in "{selectedCategory.name}"
              </Typography>
              <Paper sx={{ p: 2 }}>
                <TableContainer sx={{
                  maxHeight: 340,
                  scrollbarWidth: 'thin', // For Firefox
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(66, 165, 245, 0.5)',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'rgba(245, 247, 250, 0.8)',
                  },
                }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Buying Price</TableCell>
                        <TableCell>Selling Price</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredProducts.map(item => (
                        <TableRow key={item._id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.buyingPrice}</TableCell>
                          <TableCell>{item.price}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
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
          <Grid container spacing={3}>
            {categories.map((category) => {
              const count = categoryProductCounts[category.name] || 0;
              return (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: count > 0 ? 'pointer' : 'default' }}
                    onClick={() => count > 0 && setSelectedCategory(category)}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        {/* Render the selected icon for each category */}
                        {category.icon === 'HomeIcon' ? <HomeIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'BookIcon' ? <BookIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'HeadphonesIcon' ? <HeadphonesIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'KitchenIcon' ? <KitchenIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'DevicesIcon' ? <DevicesIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'GroceryIcon' ? <GroceryIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'SportsIcon' ? <SportsIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'PetsIcon' ? <PetsIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'CafeIcon' ? <CafeIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'FloristIcon' ? <FloristIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'LightIcon' ? <LightIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'LibraryIcon' ? <LibraryIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'PharmacyIcon' ? <PharmacyIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'ToysIcon' ? <ToysIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'MoreHorizIcon' ? <MoreHorizIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'LightbulbIcon' ? <LightbulbIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'ClothesIcon' ? <ClothesIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'WatchIcon' ? <WatchIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'PhoneIcon' ? <PhoneIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'LaptopIcon' ? <LaptopIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'TvIcon' ? <TvIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'IronIcon' ? <IronIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        category.icon === 'ChairIcon' ? <ChairIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} /> :
                        <CategoryIcon sx={{ color: category.color || 'primary.main', fontSize: 32 }} />}
                        <Chip 
                          label={`${count} products`}
                          size="small"
                          color={count > 0 ? 'primary' : 'default'}
                        />
                      </Box>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ minHeight: 40 }}>
                        {category.description || 'No description available'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={e => { e.stopPropagation(); handleOpenDialog(category); }}
                        disabled={updateMutation.isPending}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={e => { e.stopPropagation(); handleOpenDeleteDialog(category); }}
                        disabled={count > 0 || deleteMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        );
      })()}

      {/* Empty State */}
      {!isLoading && !error && categories.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <CategoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No categories yet
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Create your first category to start organizing your inventory
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Create Category
          </Button>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete the category "{categoryToDelete?.name}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">Cancel</Button>
          <Button onClick={() => handleDeleteCategory(categoryToDelete?._id!)} color="error" variant="contained" disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Category Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              sx={{ mb: 3 }}
              helperText="Enter a unique name for this category"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              multiline
              rows={3}
              helperText="Optional description for this category"
              sx={{ mb: 3 }}
            />
            {/* Icon selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Icon</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <IconButton color={categoryIcon === 'CategoryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('CategoryIcon')}><CategoryIcon /></IconButton>
                <IconButton color={categoryIcon === 'HomeIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('HomeIcon')}><HomeIcon /></IconButton>
                <IconButton color={categoryIcon === 'BookIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('BookIcon')}><BookIcon /></IconButton>
                <IconButton color={categoryIcon === 'HeadphonesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('HeadphonesIcon')}><HeadphonesIcon /></IconButton>
                <IconButton color={categoryIcon === 'KitchenIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('KitchenIcon')}><KitchenIcon /></IconButton>
                <IconButton color={categoryIcon === 'DevicesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('DevicesIcon')}><DevicesIcon /></IconButton>
                <IconButton color={categoryIcon === 'GroceryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('GroceryIcon')}><GroceryIcon /></IconButton>
                <IconButton color={categoryIcon === 'SportsIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('SportsIcon')}><SportsIcon /></IconButton>
                <IconButton color={categoryIcon === 'PetsIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PetsIcon')}><PetsIcon /></IconButton>
                <IconButton color={categoryIcon === 'CafeIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('CafeIcon')}><CafeIcon /></IconButton>
                <IconButton color={categoryIcon === 'FloristIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('FloristIcon')}><FloristIcon /></IconButton>
                <IconButton color={categoryIcon === 'LightIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LightIcon')}><LightIcon /></IconButton>
                <IconButton color={categoryIcon === 'LibraryIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LibraryIcon')}><LibraryIcon /></IconButton>
                <IconButton color={categoryIcon === 'PharmacyIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PharmacyIcon')}><PharmacyIcon /></IconButton>
                <IconButton color={categoryIcon === 'ToysIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ToysIcon')}><ToysIcon /></IconButton>
                <IconButton color={categoryIcon === 'MoreHorizIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('MoreHorizIcon')}><MoreHorizIcon /></IconButton>
                <IconButton color={categoryIcon === 'LightbulbIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LightbulbIcon')}><LightbulbIcon /></IconButton>
                <IconButton color={categoryIcon === 'ClothesIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ClothesIcon')}><ClothesIcon /></IconButton>
                <IconButton color={categoryIcon === 'WatchIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('WatchIcon')}><WatchIcon /></IconButton>
                <IconButton color={categoryIcon === 'PhoneIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('PhoneIcon')}><PhoneIcon /></IconButton>
                <IconButton color={categoryIcon === 'LaptopIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('LaptopIcon')}><LaptopIcon /></IconButton>
                <IconButton color={categoryIcon === 'TvIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('TvIcon')}><TvIcon /></IconButton>
                <IconButton color={categoryIcon === 'IronIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('IronIcon')}><IronIcon /></IconButton>
                <IconButton color={categoryIcon === 'ChairIcon' ? 'primary' : 'default'} onClick={() => setCategoryIcon('ChairIcon')}><ChairIcon /></IconButton>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained"
            disabled={!categoryName.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending 
              ? 'Saving...' 
              : editingCategory ? 'Update' : 'Create'
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Categories;
