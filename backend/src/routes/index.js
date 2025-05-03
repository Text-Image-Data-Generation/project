const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const userRoutes = require('./userRouter');

const formData = require('express-form-data');
const formMiddleware = formData.parse();
router.use(formMiddleware);

// setting up routes
router.use('/users', userRoutes);

// middle wares 
router.post('/login', authMiddleware.login);
router.post('/signup', authMiddleware.signup);
router.get('/getProfile', authMiddleware.getProfile);
router.post('/logout', authMiddleware.logout);

module.exports = router;
