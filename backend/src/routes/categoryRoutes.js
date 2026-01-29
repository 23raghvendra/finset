import express from 'express';
import {
  getCategories,
  createCategory,
  deleteCategory,
  initDefaultCategories
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/categories
// @desc    Get all categories for user
// @access  Private
router.get('/', getCategories);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', createCategory);

// @route   POST /api/categories/init-defaults
// @desc    Initialize default categories
// @access  Private
router.post('/init-defaults', initDefaultCategories);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', deleteCategory);

export default router;
