const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.REACT_APP_MONGO_LINK) {
            throw new Error('MongoDB connection string is not defined in the environment variables');
        }
        await mongoose.connect(process.env.REACT_APP_MONGO_LINK);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection failed:', err.message);
        process.exit(1); // Exits the process if connection fails
    }
};

module.exports = connectDB; // Ensure proper export
