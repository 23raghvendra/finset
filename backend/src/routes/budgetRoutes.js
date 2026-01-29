import express from 'express';
import {
    getBudgets,
    getBudget,
    createBudget,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
    .get(getBudgets)
    .post(createBudget);

router.route('/:id')
    .get(getBudget)
    .put(updateBudget)
    .delete(deleteBudget);

export default router;
