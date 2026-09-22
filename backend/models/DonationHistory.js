const mongoose = require('mongoose');

// DonationHistory Schema - Records previous blood donations made by a donor
const donationHistorySchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    units: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      default: 'Completed',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DonationHistory', donationHistorySchema);
