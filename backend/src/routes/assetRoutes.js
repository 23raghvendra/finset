import express from 'express';
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetSummary
} from '../controllers/assetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/assets/summary
// @desc    Get asset summary
// @access  Private
router.get('/summary', getAssetSummary);

// @route   GET /api/assets
// @desc    Get all assets for user
// @access  Private
router.get('/', getAssets);

// @route   POST /api/assets
// @desc    Create a new asset
// @access  Private
router.post('/', createAsset);

// @route   PUT /api/assets/:id
// @desc    Update an asset
// @access  Private
router.put('/:id', updateAsset);

// @route   DELETE /api/assets/:id
// @desc    Delete an asset
// @access  Private
router.delete('/:id', deleteAsset);

export default router;
