const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please add a rating between 1 and 5'],
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true,
        unique: true, // A patient can only review a single appointment once
    },
}, { timestamps: true });

// Static method to get the average rating and save it to the doctor's profile
ReviewSchema.statics.getAverageRating = async function(doctorId) {
    const obj = await this.aggregate([
        {
            $match: { doctor: doctorId }
        },
        {
            $group: {
                _id: '$doctor',
                averageRating: { $avg: '$rating' },
                numberOfReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        await mongoose.model('DoctorProfile').findOneAndUpdate(
            { user: doctorId }, 
            {
                averageRating: obj[0] ? obj[0].averageRating.toFixed(1) : 0,
                numberOfReviews: obj[0] ? obj[0].numberOfReviews : 0
            }
        );
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after a review is saved
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.doctor);
});

// Call getAverageRating before a review is removed
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.doctor);
});


module.exports = mongoose.model('Review', ReviewSchema);