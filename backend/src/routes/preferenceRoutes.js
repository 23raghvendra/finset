import express from 'express';
import {
  getPreferences,
  updatePreferences,
  updatePreferenceField,
  resetPreferences
} from '../controllers/preferenceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/preferences
// @desc    Get user preferences
// @access  Private
router.get('/', getPreferences);

// @route   PUT /api/preferences
// @desc    Update user preferences
// @access  Private
router.put('/', updatePreferences);

// @route   PATCH /api/preferences/:field
// @desc    Update specific preference field
// @access  Private
router.patch('/:field', updatePreferenceField);

// @route   POST /api/preferences/reset
// @desc    Reset preferences to defaults
// @access  Private
router.post('/reset', resetPreferences);

export default router;
