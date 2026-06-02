const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'institution'], default: 'institution' },
  institutionName: { type: String, required: true, trim: true },
  institutionType: { type: String, enum: ['primary', 'junior', 'senior', 'college'], default: null },
  contactPersonName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, trim: true },
  password: { type: String, required: true },
  registrationFeePaid: { type: Boolean, default: false },
  registrationPaymentSubmitted: { type: Boolean, default: false },
  serviceActive: { type: Boolean, default: false },
  installationFeePaid: { type: Boolean, default: false },
  monthlyFeePaid: { type: Boolean, default: false },
  needsReconnection: { type: Boolean, default: false },
  currentBandwidth: { type: String, enum: ['4', '10', '20', '25', '50'], default: null },
  numberOfUsers: { type: Number, default: 0 },
  lanNodesPurchased: { type: Number, default: 0 },
  computersPurchased: { type: Number, default: 0 },
  hasLAN: { type: Boolean, default: false },
  isReadyForConnectivity: { type: Boolean, default: false },
  currentMonth: { type: String, default: null }, // e.g. "2025-07" — month for which monthly fee was last paid
  reconnectionFeePaid: { type: Boolean, default: false },
  disconnectedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);
