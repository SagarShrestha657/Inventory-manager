import express from 'express';
import auth from '../middleware/authMiddleware';
import { setGoal, getGoals, updateGoal } from '../controllers/goalController';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(auth);

// Set a new goal (monthly or yearly)
router.post('/', setGoal);

// Get all goals for the authenticated user
router.get('/', getGoals);

// Update an existing goal
router.put('/', updateGoal);

export default router;
