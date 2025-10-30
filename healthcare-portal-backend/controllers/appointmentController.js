const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); // <-- Import uuid for unique video call IDs

// @desc    Get available slots for a doctor on a specific date
exports.getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;
        const appointmentDate = new Date(date);
        const dayOfWeek = appointmentDate.toLocaleString('en-us', { weekday: 'long' });
        const doctorProfile = await DoctorProfile.findOne({ user: doctorId });

        if (!doctorProfile || !doctorProfile.availability) {
            return res.status(404).json({ msg: 'Availability not found for this doctor.' });
        }

        const daySchedule = doctorProfile.availability.find(d => d.day === dayOfWeek);
        if (!daySchedule) return res.json([]);

        const allSlots = [];
        daySchedule.timeSlots.forEach(slot => {
            let currentTime = new Date(`${date}T${slot.startTime}:00`);
            const endTime = new Date(`${date}T${slot.endTime}:00`);
            while (currentTime < endTime) {
                allSlots.push(currentTime.toTimeString().substring(0, 5));
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }
        });

        const bookedAppointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate,
            status: 'Scheduled'
        });

        const bookedSlots = bookedAppointments.map(app => app.timeSlot);
        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.json(availableSlots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new appointment
// This function will now ONLY be called by our payment verification,
// or in cases where the consultation fee is 0
exports.createAppointment = async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot } = req.body;
        const patientId = req.user.id;

        // Check for existing scheduled appointment for the same time
        const existingAppointment = await Appointment.findOne({
            doctor: doctorId,
            appointmentDate,
            timeSlot,
            status: 'Scheduled'
        });

        if (existingAppointment) {
            return res.status(400).json({ msg: 'This time slot is no longer available.' });
        }

        // Use Stripe session ID if passed from payment verification, else random UUID
        const videoCallId = req.body.sessionId || uuidv4();

        const newAppointment = new Appointment({
            patient: patientId,
            doctor: doctorId,
            appointmentDate,
            timeSlot,
            videoCallId, // Stripe session ID or fallback UUID
            status: 'Scheduled',
        });

        const appointment = await newAppointment.save();

        // Notify doctor via Socket.IO
        if (req.io) {
            req.io.to(`booking-room-${doctorId}`).emit('slotBooked', { timeSlot });
        }

        res.status(201).json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get appointments for the logged-in user
exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let appointments;

        if (userRole === 'patient') {
            appointments = await Appointment.find({ patient: userId, patientVisible: true }).populate('doctor', 'name');
        } else if (userRole === 'doctor') {
            appointments = await Appointment.find({ doctor: userId }).populate('patient', 'name');
        } else {
            appointments = [];
        }

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Cancel an appointment (for patients)
exports.cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        if (appointment.patient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        const { io, onlineUsers } = req;
        const doctorSocketId = onlineUsers?.[appointment.doctor.toString()];
        if (doctorSocketId) {
            io.to(doctorSocketId).emit('appointmentStatusChanged', appointment);
        }

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Mark an appointment as completed (for doctors)
exports.completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        if (appointment.doctor.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        appointment.status = 'Completed';
        await appointment.save();

        const { io, onlineUsers } = req;
        const patientSocketId = onlineUsers?.[appointment.patient.toString()];
        if (patientSocketId) {
            io.to(patientSocketId).emit('appointmentStatusChanged', appointment);
        }

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Hide an appointment from the patient's view
exports.hideAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

        if (appointment.patient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        appointment.patientVisible = false;
        await appointment.save();

        res.json({ msg: 'Appointment hidden successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Reschedule an appointment (for patients)
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { appointmentDate, timeSlot } = req.body;
        const appointment = await Appointment.findById(req.params.appointmentId);

        if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });
        if (appointment.patient.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });
        if (appointment.status !== 'Scheduled') {
            return res.status(400).json({ msg: 'Only scheduled appointments can be rescheduled.' });
        }

        const existingAppointment = await Appointment.findOne({
            doctor: appointment.doctor,
            appointmentDate,
            timeSlot,
            status: 'Scheduled'
        });

        if (existingAppointment) {
            return res.status(400).json({ msg: 'This new time slot is not available.' });
        }

        appointment.appointmentDate = appointmentDate;
        appointment.timeSlot = timeSlot;
        await appointment.save();

        if (req.io) {
            req.io.to(`booking-room-${appointment.doctor.toString()}`).emit('slotBooked', { timeSlot: appointment.timeSlot });
        }

        const { io, onlineUsers } = req;
        const doctorSocketId = onlineUsers?.[appointment.doctor.toString()];
        if (doctorSocketId) {
            io.to(doctorSocketId).emit('appointmentStatusChanged', appointment);
        }

        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
