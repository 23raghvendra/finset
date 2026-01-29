import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// @desc    Get all budgets for logged in user
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });

        // Calculate spending for each budget
        const budgetsWithSpending = await Promise.all(
            budgets.map(async (budget) => {
                const spending = await Transaction.aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            type: 'expense',
                            category: budget.category,
                            date: {
                                $gte: budget.startDate,
                                $lte: budget.endDate
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                return {
                    ...budget.toObject(),
                    spent: spending[0]?.total || 0,
                    remaining: budget.amount - (spending[0]?.total || 0),
                    percentage: ((spending[0]?.total || 0) / budget.amount) * 100
                };
            })
        );

        res.status(200).json({
            success: true,
            count: budgetsWithSpending.length,
            data: budgetsWithSpending
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single budget
// @route   GET /api/budgets/:id
// @access  Private
export const getBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        // Make sure user owns budget
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this budget'
            });
        }

        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res) => {
    try {
        req.body.user = req.user._id;

        const budget = await Budget.create(req.body);

        res.status(201).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res) => {
    try {
        let budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        // Make sure user owns budget
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this budget'
            });
        }

        budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        // Make sure user owns budget
        if (budget.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this budget'
            });
        }

        await budget.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
