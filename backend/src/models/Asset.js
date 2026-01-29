import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide an asset name'],
        trim: true,
        maxlength: [100, 'Asset name cannot be more than 100 characters']
    },
    type: {
        type: String,
        enum: ['Savings', 'Investments', 'Property', 'Vehicle', 'Other'],
        required: [true, 'Please specify asset type']
    },
    value: {
        type: Number,
        required: [true, 'Please provide asset value'],
        min: [0, 'Asset value cannot be negative']
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
assetSchema.index({ user: 1, type: 1 });
assetSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Asset', assetSchema);
