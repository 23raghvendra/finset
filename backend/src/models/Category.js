import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: [true, 'Please specify category type']
    },
    name: {
        type: String,
        required: [true, 'Please provide a category name'],
        trim: true,
        maxlength: [50, 'Category name cannot be more than 50 characters']
    },
    color: {
        type: String,
        default: '#8470FF'
    },
    icon: {
        type: String,
        default: 'Tag'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster queries
categorySchema.index({ user: 1, type: 1 });
categorySchema.index({ user: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
