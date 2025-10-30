// healthcare-portal-backend/controllers/reviewController.js

const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

// @desc    Get all reviews for a specific doctor
exports.getReviewsForDoctor = async (req, res) => {
    try {
        const reviews = await Review.find({ doctor: req.params.doctorId })
            .populate('patient', 'name');
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new review for an appointment
exports.createReview = async (req, res) => {
    const { rating, comment } = req.body;
    const { doctorId, appointmentId } = req.params;
    const patientId = req.user.id;

    try {
        // 1. Check if the appointment exists and is completed
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found.' });
        }
        if (appointment.status !== 'Completed') {
            return res.status(400).json({ msg: 'You can only review completed appointments.' });
        }

        // 2. Security Check: Verify that the appointment belongs to the logged-in patient and correct doctor
        if (appointment.patient.toString() !== patientId || appointment.doctor.toString() !== doctorId) {
            return res.status(401).json({ msg: 'Not authorized to review this appointment.' });
        }

        // 3. Check if a review for this appointment already exists
        const existingReview = await Review.findOne({ appointment: appointmentId });
        if (existingReview) {
            return res.status(400).json({ msg: 'You have already reviewed this appointment.' });
        }

        // 4. Create and save the new review
        const review = await Review.create({
            rating,
            comment,
            doctor: doctorId,
            patient: patientId,
            appointment: appointmentId,
        });

        // --- NEW: Mark the appointment as reviewed ---
        appointment.isReviewed = true;
        await appointment.save();

        // --- NEW: Update doctor’s average rating and review count ---
        const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
        if (doctorProfile) {
            // Recalculate average rating
            const allReviews = await Review.find({ doctor: doctorId });
            const totalReviews = allReviews.length;
            const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
            doctorProfile.averageRating = totalRating / totalReviews;
            doctorProfile.numberOfReviews = totalReviews;
            await doctorProfile.save();
        }

        res.status(201).json(review);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
