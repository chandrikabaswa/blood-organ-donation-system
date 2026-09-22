const mongoose = require('mongoose');

// DonorResponse Schema - Tracks matching donor response to a hospital blood request
const donorResponseSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending',
    },
    responseDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

donorResponseSchema.index({ requestId: 1, donorId: 1 }, { unique: true });

module.exports = mongoose.model('DonorResponse', donorResponseSchema);
