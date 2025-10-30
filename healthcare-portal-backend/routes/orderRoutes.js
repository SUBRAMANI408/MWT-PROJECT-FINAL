const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { verifyOrderPayment, getMyOrders } = require('../controllers/orderController');

// @route   POST /api/orders/verify-payment
// @desc    Verify Stripe session and create order
// @access  Private
router.post('/verify-payment', authMiddleware, verifyOrderPayment);

// @route   GET /api/orders/my
// @desc    Get all of the logged-in patient's orders
// @access  Private
router.get('/my', authMiddleware, getMyOrders);

module.exports = router;