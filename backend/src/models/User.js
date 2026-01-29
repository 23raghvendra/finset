import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        currency: {
            type: String,
            default: 'INR'
        },
        dashboardLayout: {
            type: Array,
            default: []
        },
        offlineMode: {
            type: Boolean,
            default: false
        },
        virtualScroll: {
            type: Boolean,
            default: false
        },
        emergencyFund: {
            monthlyExpenses: { type: Number, default: 0 },
            target: { type: Number, default: 6 },
            current: { type: Number, default: 0 }
        },
        retirement: {
            currentAge: { type: Number, default: 25 },
            retirementAge: { type: Number, default: 60 },
            monthlyExpense: { type: Number, default: 0 },
            currentSavings: { type: Number, default: 0 },
            expectedReturn: { type: Number, default: 12 },
            inflation: { type: Number, default: 6 }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
