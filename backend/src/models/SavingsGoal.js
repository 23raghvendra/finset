import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a goal name'],
        trim: true,
        maxlength: [100, 'Goal name cannot be more than 100 characters']
    },
    targetAmount: {
        type: Number,
        required: [true, 'Please provide a target amount'],
        min: [0, 'Target amount cannot be negative']
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: [0, 'Current amount cannot be negative']
    },
    deadline: {
        type: Date,
        required: false
    },
    category: {
        type: String,
        default: 'General'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Virtual for progress percentage
savingsGoalSchema.virtual('progress').get(function () {
    return (this.currentAmount / this.targetAmount) * 100;
});

// Index for faster queries
savingsGoalSchema.index({ user: 1, isCompleted: 1 });

export default mongoose.model('SavingsGoal', savingsGoalSchema);
