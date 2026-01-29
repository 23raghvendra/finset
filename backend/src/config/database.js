import mongoose from 'mongoose';

let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection, use it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    // Set connection options
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000,
    };

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('🔄 Connecting to MongoDB...');

        // In Mongoose 6+, connect() returns a promise that resolves to mongoose
        cachedConnection = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
        return cachedConnection;
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // In serverless, we might want to throw the error to let the request fail fast
        throw error;
    }
};

export default connectDB;
