import express from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import auth from '../middleware/authMiddleware'; // Import authentication middleware

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// GET /api/categories - Get all categories for authenticated user
router.get('/', getCategories);

// GET /api/categories/stats - Get category statistics

// GET /api/categories/:id - Get specific category by ID
router.get('/:id', getCategoryById);

// POST /api/categories - Create new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete category (soft delete)
router.delete('/:id', deleteCategory);

export default router;
