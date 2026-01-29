import Asset from '../models/Asset.js';

/**
 * Get all assets for the authenticated user
 * @route GET /api/assets
 */
export const getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: assets.length,
      assets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assets',
      error: error.message
    });
  }
};

/**
 * Create a new asset
 * @route POST /api/assets
 */
export const createAsset = async (req, res) => {
  try {
    const { name, type, value, notes } = req.body;

    const asset = await Asset.create({
      user: req.user._id,
      name,
      type,
      value,
      notes,
      lastUpdated: new Date()
    });

    res.status(201).json({
      success: true,
      asset
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating asset',
      error: error.message
    });
  }
};

/**
 * Update an asset
 * @route PUT /api/assets/:id
 */
export const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const { name, type, value, notes } = req.body;

    asset.name = name || asset.name;
    asset.type = type || asset.type;
    asset.value = value !== undefined ? value : asset.value;
    asset.notes = notes !== undefined ? notes : asset.notes;
    asset.lastUpdated = new Date();

    await asset.save();

    res.json({
      success: true,
      asset
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating asset',
      error: error.message
    });
  }
};

/**
 * Delete an asset
 * @route DELETE /api/assets/:id
 */
export const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    await asset.deleteOne();

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting asset',
      error: error.message
    });
  }
};

/**
 * Get asset summary
 * @route GET /api/assets/summary
 */
export const getAssetSummary = async (req, res) => {
  try {
    const assets = await Asset.find({ user: req.user._id });
    
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    
    const byType = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + asset.value;
      return acc;
    }, {});

    res.json({
      success: true,
      summary: {
        totalValue,
        count: assets.length,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching asset summary',
      error: error.message
    });
  }
};
