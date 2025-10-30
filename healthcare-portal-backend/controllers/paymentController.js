require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Order = require('../models/Order');
const sendEmail = require('../utils/mailer');

// --- MEDICINE CHECKOUT SESSION ---
exports.createCheckoutSession = async (req, res) => {
    try {
        const { cartItems } = req.body;
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const line_items = cartItems.map(item => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                    images: [item.imageUrl],
                    metadata: { medicineId: item._id }
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            customer_email: user.email,
            shipping_address_collection: {
                allowed_countries: ['IN', 'US', 'CA', 'GB'],
            },
            success_url: `http://localhost:5173/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/cart`,
            metadata: {
                patientId: userId,
                cartItems: JSON.stringify(cartItems.map(item => ({
                    medicineId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })))
            },
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe cart error:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- APPOINTMENT CHECKOUT SESSION ---
exports.createAppointmentCheckoutSession = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot } = req.body;
        const patientId = req.user.id;

        const doctorProfile = await DoctorProfile.findOne({ user: doctorId }).populate('user', 'name');
        if (!doctorProfile) {
            return res.status(404).json({ msg: 'Doctor not found' });
        }
        if (!doctorProfile.consultationFee || doctorProfile.consultationFee <= 0) {
            return res.status(400).json({ msg: 'This doctor has not set a valid consultation fee.' });
        }

        const feeInPaise = Math.round(doctorProfile.consultationFee * 100);
        const patient = await User.findById(patientId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: patient.email,
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `Consultation with Dr. ${doctorProfile.user.name}`,
                        description: `Appointment on ${new Date(appointmentDate).toLocaleDateString()} at ${timeSlot}`,
                    },
                    unit_amount: feeInPaise,
                },
                quantity: 1,
            }],
            metadata: {
                patientId,
                doctorId,
                appointmentDate,
                timeSlot,
                patientEmail: patient.email,
                doctorName: doctorProfile.user.name,
            },
            success_url: `http://localhost:5173/booking-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:5173/book-appointment/${doctorId}`,
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error('Stripe appointment error:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- VERIFY APPOINTMENT PAYMENT (WITH EMAIL) ---
exports.verifyAppointmentPayment = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            const { patientId, doctorId, appointmentDate, timeSlot, patientEmail, doctorName } = session.metadata;

            const existingAppointment = await Appointment.findOne({ videoCallId: session.id });
            if (existingAppointment) {
                return res.status(200).json({ msg: 'Appointment already verified.' });
            }

            const videoCallId = session.id;
            const newAppointment = new Appointment({
                patient: patientId,
                doctor: doctorId,
                appointmentDate,
                timeSlot,
                videoCallId,
                status: 'Scheduled',
            });
            await newAppointment.save();

            try {
                const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });
                const emailMessage = `
                    Hello,
                    Your appointment with Dr. ${doctorName} has been successfully booked.
                    Details:
                    Date: ${formattedDate}
                    Time: ${timeSlot}
                    
                    You can join the video call from your SmartHealth dashboard at the scheduled time.
                    Thank you for using SmartHealth.
                `;
                
                await sendEmail({
                    email: patientEmail,
                    subject: 'Your SmartHealth Appointment is Confirmed!',
                    message: emailMessage,
                });
            } catch (emailError) {
                console.error('Confirmation email could not be sent:', emailError);
            }

            res.status(201).json({ msg: 'Appointment created successfully!' });
        } else {
            return res.status(400).json({ msg: 'Payment not successful.' });
        }
    } catch (err) {
        console.error('Error verifying payment:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- STRIPE WEBHOOK HANDLER ---
exports.stripeWebhookHandler = async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) {
        console.log('Stripe webhook secret not found. Set STRIPE_WEBHOOK_SECRET in .env');
        return res.status(400).send('Webhook secret not configured.');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // --- Handle medicine order ---
        if (session.metadata && session.metadata.cartItems) {
            try {
                const cartItems = JSON.parse(session.metadata.cartItems);
                
                const newOrder = new Order({
                    patient: session.metadata.patientId,
                    products: cartItems,
                    totalAmount: session.amount_total / 100,
                    shippingAddress: session.shipping_details?.address,
                    paymentStatus: 'Paid',
                    stripeSessionId: session.id,
                });
                await newOrder.save();

                const user = await User.findById(session.metadata.patientId);
                if (user) {
                    const emailMessage = `
                        Hello ${user.name},
                        Your medicine order has been successfully placed.
                        Total Amount: ₹${(session.amount_total / 100).toFixed(2)}
                        Items: ${cartItems.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        Thank you for choosing SmartHealth Pharmacy!
                    `;
                    await sendEmail({
                        email: user.email,
                        subject: 'Your SmartHealth Medicine Order Confirmation',
                        message: emailMessage,
                    });
                }
            } catch (err) {
                console.error('Error saving order from webhook:', err);
            }
        }
    }

    res.status(200).json({ received: true });
};
