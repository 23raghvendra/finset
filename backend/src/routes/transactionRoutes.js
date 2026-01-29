import express from 'express';
import {
    getTransactions,
    getTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} from '../controllers/transactionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
    .get(getTransactions)
    .post(createTransaction);

router.get('/stats', getTransactionStats);

router.route('/:id')
    .get(getTransaction)
    .put(updateTransaction)
    .delete(deleteTransaction);

export default router;
