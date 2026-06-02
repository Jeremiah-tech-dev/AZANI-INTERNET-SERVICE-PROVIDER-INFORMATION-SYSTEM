const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  institutionName: { type: String, required: true },
  institutionType: { type: String },
  contactPersonName: { type: String },
  phoneNumber: { type: String },
  email: { type: String },
  bandwidth: { type: String, required: true },
  monthlyFee: { type: Number, required: true },
  discountedFee: { type: Number, required: true },
  currentBandwidth: { type: String, default: null },
  read: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'contacted', 'visited', 'installed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
