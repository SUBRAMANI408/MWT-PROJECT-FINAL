const mongoose = require('mongoose');

const DoctorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // --- BASIC INFO ---
    firstName: {
      type: String,
      required: [true, 'First name is required'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
    },

    // --- VERIFICATION STATUS ---
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },

    specialization: {
      type: String,
      required: true,
    },

    // --- NEW FIELD: Clinic Name ---
    clinicName: {
      type: String,
      default: '',
    },

    qualifications: [
      {
        degree: String,
        university: String,
        year: Number,
      },
    ],

    experienceInYears: {
      type: Number,
      default: 0,
    },

    consultationFee: {
      type: Number,
    },

    // --- Consultation Modes (Online / In-Person) ---
    consultationModes: [
      {
        type: String,
        enum: ['Online', 'In-Person'],
      },
    ],

    // --- Doctor Availability Schedule ---
    availability: [
      {
        day: {
          type: String,
          enum: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
          ],
          required: true,
        },
        timeSlots: [
          {
            startTime: {
              type: String, // e.g., "09:00"
              required: true,
            },
            endTime: {
              type: String, // e.g., "13:00"
              required: true,
            },
          },
        ],
      },
    ],

    // --- Doctor Address ---
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },

    // --- Insurance Providers Accepted ---
    acceptedInsurance: {
      type: [String], // List of insurance provider names
      default: [],
    },

    // --- Whether Doctor Offers Cashless Facility ---
    offersCashless: {
      type: Boolean,
      default: false,
    },

    // --- Ratings ---
    averageRating: {
      type: Number,
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DoctorProfile', DoctorProfileSchema);
