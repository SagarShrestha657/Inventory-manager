import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Chip,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

interface ManageCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>; // Function to update categories
}

const ManageCategoriesDialog: React.FC<ManageCategoriesDialogProps> = ({ open, onClose, categories, setCategories }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      localStorage.setItem('inventoryCategories', JSON.stringify(updatedCategories));
      setNewCategory('');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = categories.filter((category) => category !== categoryToDelete);
    setCategories(updatedCategories);
    localStorage.setItem('inventoryCategories', JSON.stringify(updatedCategories));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Manage Categories</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction="column" spacing={2}>
          <Box display="flex" gap={1}>
            <TextField
              label="New Category"
              variant="outlined"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddCategory();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddCategory}
              disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
            >
              <AddIcon />
            </Button>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onDelete={() => handleDeleteCategory(category)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Done</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManageCategoriesDialog;
