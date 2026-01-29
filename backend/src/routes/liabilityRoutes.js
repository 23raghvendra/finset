import express from 'express';
import {
  getLiabilities,
  createLiability,
  updateLiability,
  deleteLiability,
  getLiabilitySummary
} from '../controllers/liabilityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/liabilities/summary
// @desc    Get liability summary
// @access  Private
router.get('/summary', getLiabilitySummary);

// @route   GET /api/liabilities
// @desc    Get all liabilities for user
// @access  Private
router.get('/', getLiabilities);

// @route   POST /api/liabilities
// @desc    Create a new liability
// @access  Private
router.post('/', createLiability);

// @route   PUT /api/liabilities/:id
// @desc    Update a liability
// @access  Private
router.put('/:id', updateLiability);

// @route   DELETE /api/liabilities/:id
// @desc    Delete a liability
// @access  Private
router.delete('/:id', deleteLiability);

export default router;
