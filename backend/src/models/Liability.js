import mongoose from 'mongoose';

const liabilitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a liability name'],
        trim: true,
        maxlength: [100, 'Liability name cannot be more than 100 characters']
    },
    type: {
        type: String,
        enum: ['Credit Card', 'Home Loan', 'Car Loan', 'Personal Loan', 'Other'],
        required: [true, 'Please specify liability type']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide liability amount'],
        min: [0, 'Liability amount cannot be negative']
    },
    interestRate: {
        type: Number,
        default: 0,
        min: [0, 'Interest rate cannot be negative'],
        max: [100, 'Interest rate cannot exceed 100%']
    },
    minPayment: {
        type: Number,
        default: 0,
        min: [0, 'Minimum payment cannot be negative']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
liabilitySchema.index({ user: 1, type: 1 });
liabilitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Liability', liabilitySchema);
