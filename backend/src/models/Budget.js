import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide a budget amount'],
        min: [0, 'Budget amount cannot be negative']
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    alertThreshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
budgetSchema.index({ user: 1, category: 1 });

export default mongoose.model('Budget', budgetSchema);
