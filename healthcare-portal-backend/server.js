const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const passport = require('passport');
// Import the webhook handler directly
const { stripeWebhookHandler } = require('./controllers/paymentController');

dotenv.config();
require('./config/passport')(passport);
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// --- THIS IS THE CORRECTED MIDDLEWARE ORDER ---

// 1. Use CORS *first* to apply to all incoming requests
app.use(cors());

// 2. Define the Stripe Webhook route *separately* and *before* express.json()
// This is critical because it needs the raw request body
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), stripeWebhookHandler);

// 3. Now, use express.json() for all *other* routes
app.use(express.json());

// --- END OF CORRECTION ---

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// --- Shared socket and user data middleware ---
let onlineUsers = {};
app.use((req, res, next) => {
    req.io = io;
    req.onlineUsers = onlineUsers;
    next();
});

// --- SOCKET.IO CONNECTION LOGIC ---
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('addUser', (userId) => {
        onlineUsers[userId] = socket.id;
    });
    socket.on('joinBookingRoom', (doctorId) => {
        socket.join(`booking-room-${doctorId}`);
    });
    socket.on('leaveBookingRoom', (doctorId) => {
        socket.leave(`booking-room-${doctorId}`);
    });
    socket.on('disconnect', () => {
        Object.keys(onlineUsers).forEach(userId => {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
            }
        });
        console.log('User disconnected:', socket.id);
    });
});

// --- ALL OTHER ROUTES (defined AFTER cors() and express.json()) ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminAuthRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/surgeries', new require('./routes/surgeryRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));
app.use('/api/orders', (require('./routes/orderRoutes')));
app.use('/api/payments', require('./routes/paymentRoutes')); // Handles all non-webhook payment routes

// --- SERVER LISTEN ---
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`✅ Server with real-time features started on port ${PORT}`));