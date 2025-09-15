import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController';
import auth from '../middleware/authMiddleware';

const router = Router();

// Protect all inventory routes with authentication middleware
router.use(auth);

// GET /api/inventory - Get all inventory items
router.get('/', inventoryController.getInventory);

// POST /api/inventory - Create a new inventory item
router.post('/', inventoryController.createInventoryItem);

// Update all InventoryHistory records for a productId (name/SKU change)
router.put('/:id/update-history', inventoryController.updateProductHistory);

// PUT /api/inventory/:id - Update an inventory item
router.put('/:id', inventoryController.updateInventoryItem);

// PATCH /api/inventory/:id/quantity - Update item quantity
router.patch('/:id/quantity', inventoryController.updateItemQuantity);

// DELETE /api/inventory/:id - Delete an inventory item
router.delete('/:id', inventoryController.deleteInventoryItem);

// GET /api/inventory/history - Get inventory history for the authenticated user
router.get('/history', inventoryController.getInventoryHistory);

// Analytics Routes
router.get('/analytics/daily', inventoryController.getDailyAnalytics);
router.get('/analytics/monthly', inventoryController.getMonthlyAnalytics);
router.get('/analytics/top-selling', inventoryController.getTopSellingProducts);

// Removed deletion routes for history records as per user's decision.
// DELETE /api/inventory/history/:id - Delete a single history record
// router.delete('/history/:id', inventoryController.deleteHistoryRecord);
//
// POST /api/inventory/history/delete-multiple - Delete multiple history records
// router.post('/history/delete-multiple', inventoryController.deleteMultipleHistoryRecords);
//
// DELETE /api/inventory/history/delete-all - Delete all history records for the authenticated user
// router.delete('/history/delete-all', inventoryController.deleteAllHistoryRecords);

export default router;
