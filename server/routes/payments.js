const express = require('express');
const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');
const Payment = require('../models/Payment');
const { stkPush } = require('../services/daraja');
const router = express.Router();

const BW_PRICES = { '4': 1200, '10': 2000, '20': 3500, '25': 4000, '50': 7000 };

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// GET /api/payments/history — institution's own payment history
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ institution: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/payments/all — admin: all payment records
router.get('/all', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payments/monthly — pay monthly fee
router.post('/monthly', auth, async (req, res) => {
  try {
    const { method, phone } = req.body;
    const inst = await Institution.findById(req.user.id);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    if (!inst.serviceActive) return res.status(400).json({ message: 'Service is not active' });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Check already paid this month
    const existing = await Payment.findOne({ institution: inst._id, type: 'monthly', month: currentMonth });
    if (existing) return res.status(400).json({ message: 'Monthly fee already paid for this month' });

    const monthlyFee = BW_PRICES[inst.currentBandwidth] || 0;
    // Overdue fine applies only if they missed last month's payment (currentMonth is behind)
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const isOverdue = inst.currentMonth !== prevMonth && inst.currentMonth !== currentMonth;
    const overdueFine = isOverdue ? parseFloat((monthlyFee * 0.15).toFixed(2)) : 0;
    const totalDue = monthlyFee + overdueFine + (inst.needsReconnection ? 1000 : 0);

    if (method === 'mpesa' && phone) {
      try {
        const result = await stkPush(phone, totalDue, `MNTH-${inst._id.toString().slice(-6).toUpperCase()}`, 'Azani ISP Monthly Payment');
        return res.json({ pending: true, checkoutRequestId: result.CheckoutRequestID, totalDue });
      } catch (e) {
        return res.status(500).json({ message: `M-Pesa error: ${e.response?.data?.errorMessage || e.message}` });
      }
    }

    // Record payment
    await Payment.create({
      institution: inst._id,
      institutionName: inst.institutionName,
      type: 'monthly',
      amount: monthlyFee,
      month: currentMonth,
      method: method || 'cash',
    });

    // If overdue fine applied, record separately
    if (overdueFine > 0) {
      await Payment.create({
        institution: inst._id,
        institutionName: inst.institutionName,
        type: 'monthly',
        amount: overdueFine,
        month: currentMonth,
        method: method || 'cash',
        reference: 'overdue-fine',
      });
    }

    const updateFields = { monthlyFeePaid: true, currentMonth };
    // If they were disconnected & paying reconnection as part of this
    if (inst.needsReconnection) {
      await Payment.create({
        institution: inst._id,
        institutionName: inst.institutionName,
        type: 'reconnection',
        amount: 1000,
        method: method || 'cash',
      });
      updateFields.needsReconnection = false;
      updateFields.reconnectionFeePaid = true;
      updateFields.serviceActive = true;
      updateFields.disconnectedAt = null;
    }

    const updated = await Institution.findByIdAndUpdate(req.user.id, updateFields, { new: true, select: '-password' });
    res.json({ success: true, institution: updated, totalPaid: totalDue });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payments/installation — pay installation fee
router.post('/installation', auth, async (req, res) => {
  try {
    const { method, phone } = req.body;
    const inst = await Institution.findById(req.user.id);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    if (inst.installationFeePaid) return res.status(400).json({ message: 'Installation fee already paid' });
    if (!inst.isReadyForConnectivity) return res.status(400).json({ message: 'Institution is not ready for connectivity' });

    if (method === 'mpesa' && phone) {
      try {
        const result = await stkPush(phone, 10000, `INST-${inst._id.toString().slice(-6).toUpperCase()}`, 'Azani ISP Installation Fee');
        return res.json({ pending: true, checkoutRequestId: result.CheckoutRequestID });
      } catch (e) {
        return res.status(500).json({ message: `M-Pesa error: ${e.response?.data?.errorMessage || e.message}` });
      }
    }

    await Payment.create({
      institution: inst._id,
      institutionName: inst.institutionName,
      type: 'installation',
      amount: 10000,
      method: method || 'cash',
    });

    const updated = await Institution.findByIdAndUpdate(req.user.id, { installationFeePaid: true }, { new: true, select: '-password' });
    res.json({ success: true, institution: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payments/reconnection — pay reconnection fee standalone
router.post('/reconnection', auth, async (req, res) => {
  try {
    const { method, phone } = req.body;
    const inst = await Institution.findById(req.user.id);
    if (!inst) return res.status(404).json({ message: 'Not found' });
    if (!inst.needsReconnection) return res.status(400).json({ message: 'No reconnection required' });

    if (method === 'mpesa' && phone) {
      try {
        const result = await stkPush(phone, 1000, `RECON-${inst._id.toString().slice(-6).toUpperCase()}`, 'Azani ISP Reconnection Fee');
        return res.json({ pending: true, checkoutRequestId: result.CheckoutRequestID });
      } catch (e) {
        return res.status(500).json({ message: `M-Pesa error: ${e.response?.data?.errorMessage || e.message}` });
      }
    }

    await Payment.create({
      institution: inst._id,
      institutionName: inst.institutionName,
      type: 'reconnection',
      amount: 1000,
      method: method || 'cash',
    });

    const updated = await Institution.findByIdAndUpdate(
      req.user.id,
      { needsReconnection: false, reconnectionFeePaid: true, serviceActive: true, disconnectedAt: null },
      { new: true, select: '-password' }
    );
    res.json({ success: true, institution: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
