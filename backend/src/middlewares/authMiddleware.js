const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

// Login Controller
const login = async (req, res) => {
    console.log('Login Request:', req.body);
    const { identifier, password } = req.body;

    try {
        // Search user by either doctorName or email
        const user = await UserModel.findOne({
            $or: [
                { name: identifier },
              
            ]
        });

        if (!user) {
            console.log("User not found");
            return res.status(401).json({ error: 'UserNotFound', message: 'User not found' });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.log("Incorrect password");
            return res.status(401).json({ error: 'IncorrectPassword', message: 'Incorrect password' });
        }

        // Generate JWT token including both doctorName and email
        const token = jwt.sign(
            { username: user.name,  userid: user._id },
            process.env.REACT_APP_SECRET_KEY,
            { expiresIn: '3d' }
        );

        // Set the token in a cookie with security options to reduce XSS risks
        res.cookie("jwt", token, {
            withCredentials: true,
            httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
            maxAge: process.env.REACT_APP_MAX_AGE, // Example: 3*24*60*60*1000 for 3 days in milliseconds
            sameSite: 'strict'
        });
       

        res.json({ status: 'success', token, created: true, username: user.name, userid: user._id });
    } catch (error) {
        console.error('Login error:', error);
        res.sendStatus(500);
    }
};



// Signup Controller
const signup = async (req, res) => {
    console.log(req.body);
    const { name, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ name });
        if (existingUser) {
            return res.status(400).json({
                error: 'UserExists',
                message: 'A user with that name or email already exists'
            });
        }

        // Create user with hashed password
        const newUser = new UserModel({
            name,
            passwordHash: password // Hashing handled in pre-save hook
        });

        await newUser.save();

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            userId: newUser._id,
            username: newUser.name
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'ServerError', message: 'Internal server error' });
    }
};

// Get Profile Controller
const getProfile = (req, res) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'No token found' });
    }

    try {
        const decoded = jwt.verify(token, process.env.REACT_APP_SECRET_KEY);
        // Prefer doctorName from the token, otherwise fallback to email
        res.json({ username: decoded.username , userid: decoded.userid });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Logged out successfully' });
};

module.exports = {
    login,
    getProfile,
    logout,
    signup,
};
