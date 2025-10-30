const Order = require('../models/Order');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Verify a Stripe payment and create a new order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyOrderPayment = async (req, res) => {
    try {
        const { session_id } = req.body;
        const patientId = req.user.id;

        // --- THIS IS THE FIX ---
        // Check if an order with this session ID already exists (created by the webhook)
        const existingOrder = await Order.findOne({ stripeSessionId: session_id });
        if (existingOrder) {
            // If it exists, the webhook already did its job. Just send success.
            return res.status(200).json({ msg: 'Order already verified.' });
        }
        // --- END OF FIX ---

        // If it doesn't exist, this code will run (as a backup)
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid' && session.metadata.patientId === patientId) {
            
            const cartItems = JSON.parse(session.metadata.cartItems);
            const shippingAddress = session.shipping_details?.address || null;

            const newOrder = new Order({
                patient: patientId,
                products: cartItems,
                totalAmount: session.amount_total / 100,
                shippingAddress: shippingAddress,
                paymentStatus: 'Paid',
                stripeSessionId: session.id,
            });

            await newOrder.save();
            res.status(201).json({ msg: 'Order created successfully!', order: newOrder });
        } else {
            return res.status(400).json({ msg: 'Payment not successful or session mismatch.' });
        }
    } catch (err) {
        console.error('Error verifying order payment:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all orders for the logged-in patient
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ patient: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err.message);
        res.status(500).send('Server Error');
    }
};