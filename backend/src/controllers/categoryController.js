import Category from '../models/Category.js';

/**
 * Get all categories for the authenticated user
 * @route GET /api/categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ createdAt: 1 });
    
    // Group by type
    const grouped = {
      income: categories.filter(c => c.type === 'income').map(c => c.name),
      expense: categories.filter(c => c.type === 'expense').map(c => c.name)
    };
    
    res.json({
      success: true,
      categories: grouped,
      raw: categories // Also send raw data with IDs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

/**
 * Create a new category
 * @route POST /api/categories
 */
export const createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      user: req.user._id,
      name: name.trim(),
      type
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
      type,
      color: color || '#8470FF',
      icon: icon || 'Tag',
      isDefault: false
    });

    res.status(201).json({
      success: true,
      category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

/**
 * Delete a category
 * @route DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default categories'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

/**
 * Initialize default categories for a user
 * @route POST /api/categories/init-defaults
 */
export const initDefaultCategories = async (req, res) => {
  try {
    // Check if user already has categories
    const existingCount = await Category.countDocuments({ user: req.user._id });
    
    if (existingCount > 0) {
      return res.json({
        success: true,
        message: 'Categories already initialized'
      });
    }

    const defaultCategories = [
      // Expense categories
      { type: 'expense', name: 'Food & Dining', color: '#EF4444', isDefault: true },
      { type: 'expense', name: 'Shopping', color: '#F59E0B', isDefault: true },
      { type: 'expense', name: 'Transportation', color: '#10B981', isDefault: true },
      { type: 'expense', name: 'Bills & Utilities', color: '#6366F1', isDefault: true },
      { type: 'expense', name: 'Entertainment', color: '#EC4899', isDefault: true },
      { type: 'expense', name: 'Healthcare', color: '#14B8A6', isDefault: true },
      { type: 'expense', name: 'Education', color: '#8B5CF6', isDefault: true },
      { type: 'expense', name: 'Travel', color: '#F97316', isDefault: true },
      { type: 'expense', name: 'Groceries', color: '#10B981', isDefault: true },
      { type: 'expense', name: 'Other', color: '#6B7280', isDefault: true },
      // Income categories
      { type: 'income', name: 'Salary', color: '#10B981', isDefault: true },
      { type: 'income', name: 'Freelance', color: '#8470FF', isDefault: true },
      { type: 'income', name: 'Investment', color: '#6366F1', isDefault: true },
      { type: 'income', name: 'Business', color: '#F59E0B', isDefault: true },
      { type: 'income', name: 'Other', color: '#6B7280', isDefault: true }
    ];

    const categories = await Category.insertMany(
      defaultCategories.map(cat => ({ ...cat, user: req.user._id }))
    );

    res.status(201).json({
      success: true,
      message: 'Default categories initialized',
      count: categories.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing categories',
      error: error.message
    });
  }
};
