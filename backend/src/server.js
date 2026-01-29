import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import liabilityRoutes from './routes/liabilityRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';

dotenv.config();

// Check for required environment variables
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.error(`⚠️  Missing required environment variable: ${env}`);
    }
});

// For Vercel, we call connectDB but don't crash the entire function if it fails initially
connectDB();

const app = express();

// Ensure DB is connected before processing requests
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection error',
            error: error.message
        });
    }
});

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.indexOf(origin) !== -1 ||
            origin.endsWith('.vercel.app') ||
            process.env.NODE_ENV === 'development';

        if (isAllowed) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin ${origin} not allowed`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/liabilities', liabilityRoutes);
app.use('/api/preferences', preferenceRoutes);

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Finance Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            transactions: '/api/transactions',
            budgets: '/api/budgets',
            goals: '/api/goals',
            categories: '/api/categories',
            assets: '/api/assets',
            liabilities: '/api/liabilities',
            preferences: '/api/preferences'
        }
    });
});

app.use(notFound);
app.use(errorHandler);

// Start server only if not running on Vercel
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const HOST = process.env.HOST || '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📡 API available at http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`❌ Error: ${err.message}`);
        // Close server & exit process
        server.close(() => process.exit(1));
    });
}

export default app;
