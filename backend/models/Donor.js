const mongoose = require('mongoose');

// Donor Schema - Stores personal & health details for donor users
const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Information
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
      immutable: true, // Blood group is fixed and read-only
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Health Information
    weight: {
      type: Number, // in kg
      default: 55,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    takingMedication: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    chronicDisease: {
      type: String,
      enum: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Kidney Disease', 'Asthma', 'Other'],
      default: 'None',
    },
    otherDiseaseName: {
      type: String,
      default: '',
    },
    recentSurgery: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    recentFever: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },

    // Automatically calculated by backend eligibility service
    eligibility: {
      status: {
        type: String,
        enum: ['Eligible', 'Not Eligible'],
        default: 'Eligible',
      },
      reason: {
        type: String,
        default: 'Meets basic eligibility criteria',
      },
      lastCalculated: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donor', donorSchema);
