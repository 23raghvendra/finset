import Liability from '../models/Liability.js';

/**
 * Get all liabilities for the authenticated user
 * @route GET /api/liabilities
 */
export const getLiabilities = async (req, res) => {
  try {
    const liabilities = await Liability.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: liabilities.length,
      liabilities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching liabilities',
      error: error.message
    });
  }
};

/**
 * Create a new liability
 * @route POST /api/liabilities
 */
export const createLiability = async (req, res) => {
  try {
    const { name, type, amount, interestRate, minPayment, notes } = req.body;

    const liability = await Liability.create({
      user: req.user._id,
      name,
      type,
      amount,
      interestRate: interestRate || 0,
      minPayment: minPayment || amount * 0.02,
      notes,
      lastUpdated: new Date()
    });

    res.status(201).json({
      success: true,
      liability
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating liability',
      error: error.message
    });
  }
};

/**
 * Update a liability
 * @route PUT /api/liabilities/:id
 */
export const updateLiability = async (req, res) => {
  try {
    const liability = await Liability.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!liability) {
      return res.status(404).json({
        success: false,
        message: 'Liability not found'
      });
    }

    const { name, type, amount, interestRate, minPayment, notes } = req.body;

    liability.name = name || liability.name;
    liability.type = type || liability.type;
    liability.amount = amount !== undefined ? amount : liability.amount;
    liability.interestRate = interestRate !== undefined ? interestRate : liability.interestRate;
    liability.minPayment = minPayment !== undefined ? minPayment : liability.minPayment;
    liability.notes = notes !== undefined ? notes : liability.notes;
    liability.lastUpdated = new Date();

    await liability.save();

    res.json({
      success: true,
      liability
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating liability',
      error: error.message
    });
  }
};

/**
 * Delete a liability
 * @route DELETE /api/liabilities/:id
 */
export const deleteLiability = async (req, res) => {
  try {
    const liability = await Liability.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!liability) {
      return res.status(404).json({
        success: false,
        message: 'Liability not found'
      });
    }

    await liability.deleteOne();

    res.json({
      success: true,
      message: 'Liability deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting liability',
      error: error.message
    });
  }
};

/**
 * Get liability summary
 * @route GET /api/liabilities/summary
 */
export const getLiabilitySummary = async (req, res) => {
  try {
    const liabilities = await Liability.find({ user: req.user._id });
    
    const totalAmount = liabilities.reduce((sum, liability) => sum + liability.amount, 0);
    const totalInterest = liabilities.reduce((sum, liability) => {
      return sum + (liability.amount * liability.interestRate / 100);
    }, 0);
    
    const byType = liabilities.reduce((acc, liability) => {
      acc[liability.type] = (acc[liability.type] || 0) + liability.amount;
      return acc;
    }, {});

    res.json({
      success: true,
      summary: {
        totalAmount,
        totalInterest,
        count: liabilities.length,
        byType
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching liability summary',
      error: error.message
    });
  }
};
