const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // We store the products as a sub-array
    products: [{
        medicineId: { type: String }, // Storing as string for simplicity
        name: String,
        price: Number,
        quantity: Number,
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        city: { type: String },
        country: { type: String },
        line1: { type: String },
        line2: { type: String },
        postal_code: { type: String },
        state: { type: String },
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending',
    },
    stripeSessionId: { // This links the order to the Stripe payment
        type: String,
        required: true,
        unique: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);