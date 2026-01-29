import SavingsGoal from '../models/SavingsGoal.js';

// @desc    Get all savings goals for logged in user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single savings goal
// @route   GET /api/goals/:id
// @access  Private
export const getGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        // Make sure user owns goal
        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this goal'
            });
        }

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create new savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res) => {
    try {
        req.body.user = req.user._id;
        if (req.body.deadline === '' || req.body.deadline === null) {
            delete req.body.deadline;
        }

        const goal = await SavingsGoal.create(req.body);

        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update savings goal
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res) => {
    try {
        let goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        // Make sure user owns goal
        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to update this goal'
            });
        }

        // Check if goal is being marked as completed
        if (req.body.isCompleted && !goal.isCompleted) {
            req.body.completedAt = new Date();
        }
        if (req.body.deadline === '' || req.body.deadline === null) {
            delete req.body.deadline;
        }

        goal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete savings goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res) => {
    try {
        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        // Make sure user owns goal
        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to delete this goal'
            });
        }

        await goal.deleteOne();

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

// @desc    Add contribution to savings goal
// @route   POST /api/goals/:id/contribute
// @access  Private
export const contributeToGoal = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid positive amount'
            });
        }

        const goal = await SavingsGoal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Savings goal not found'
            });
        }

        // Make sure user owns goal
        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to contribute to this goal'
            });
        }

        goal.currentAmount += amount;

        // Check if goal is completed
        if (goal.currentAmount >= goal.targetAmount && !goal.isCompleted) {
            goal.isCompleted = true;
            goal.completedAt = new Date();
        }

        await goal.save();

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
