import User from '../models/User.js';

/**
 * Get user preferences
 * @route GET /api/preferences
 */
export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    res.json({
      success: true,
      preferences: user.preferences || {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};

/**
 * Update user preferences
 * @route PUT /api/preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences (merge with existing)
    user.preferences = {
      ...user.preferences,
      ...req.body
    };

    await user.save();

    res.json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating preferences',
      error: error.message
    });
  }
};

/**
 * Update specific preference field
 * @route PATCH /api/preferences/:field
 */
export const updatePreferenceField = async (req, res) => {
  try {
    const { field } = req.params;
    const { value } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle nested fields (e.g., 'emergencyFund.current')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!user.preferences[parent]) {
        user.preferences[parent] = {};
      }
      user.preferences[parent][child] = value;
    } else {
      user.preferences[field] = value;
    }

    await user.save();

    res.json({
      success: true,
      field,
      value,
      preferences: user.preferences
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating preference field',
      error: error.message
    });
  }
};

/**
 * Reset preferences to defaults
 * @route POST /api/preferences/reset
 */
export const resetPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.preferences = {
      theme: 'light',
      currency: 'INR',
      dashboardLayout: [],
      offlineMode: false,
      virtualScroll: false,
      emergencyFund: {
        monthlyExpenses: 0,
        target: 6,
        current: 0
      },
      retirement: {
        currentAge: 25,
        retirementAge: 60,
        monthlyExpense: 0,
        currentSavings: 0,
        expectedReturn: 12,
        inflation: 6
      }
    };

    await user.save();

    res.json({
      success: true,
      message: 'Preferences reset to defaults',
      preferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting preferences',
      error: error.message
    });
  }
};
