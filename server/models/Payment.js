const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  institutionName: { type: String, required: true },
  type: {
    type: String,
    enum: ['registration', 'installation', 'monthly', 'reconnection'],
    required: true
  },
  amount: { type: Number, required: true },
  month: { type: String, default: null }, // e.g. "2025-07" for monthly payments
  method: { type: String, enum: ['cash', 'mpesa'], default: 'cash' },
  reference: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
