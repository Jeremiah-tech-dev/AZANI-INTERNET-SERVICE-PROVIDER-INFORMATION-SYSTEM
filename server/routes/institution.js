const express = require('express');
const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');
const { stkPush } = require('../services/daraja');
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// GET /api/institution/me
router.get('/me', auth, async (req, res) => {
  try {
    const inst = await Institution.findById(req.user.id).select('-password');
    if (!inst) return res.status(404).json({ message: 'Not found' });
    res.json(inst);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/institution/infrastructure
router.put('/infrastructure', auth, async (req, res) => {
  try {
    const { numberOfUsers, computersPurchased, lanNodesPurchased, hasLAN, isReadyForConnectivity } = req.body;
    const inst = await Institution.findByIdAndUpdate(
      req.user.id,
      { numberOfUsers, computersPurchased, lanNodesPurchased, hasLAN, isReadyForConnectivity },
      { new: true, select: '-password' }
    );
    res.json(inst);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/institution/pay-registration
router.post('/pay-registration', auth, async (req, res) => {
  try {
    const { method, phone } = req.body;
    const institution = await Institution.findById(req.user.id);

    if (method === 'mpesa') {
      try {
        const result = await stkPush(
          phone,
          1,
          `REG-${institution._id.toString().slice(-6).toUpperCase()}`,
          'Azani ISP Registration Fee'
        );
        return res.json({
          pending: true,
          checkoutRequestId: result.CheckoutRequestID,
          message: 'STK push sent. Enter M-Pesa PIN to complete.'
        });
      } catch (mpesaErr) {
        const errMsg = mpesaErr.response?.data?.errorMessage || mpesaErr.message;
        console.error('Daraja error:', errMsg);
        return res.status(500).json({ message: `M-Pesa error: ${errMsg}` });
      }
    }

    // Cash or mpesa confirm: mark payment as submitted but NOT activate — admin reviews
    const inst = await Institution.findByIdAndUpdate(
      req.user.id,
      { registrationPaymentSubmitted: true },
      { new: true, select: '-password' }
    );
    res.json({ pending: false, submitted: true, institution: inst });
  } catch (err) {
    console.error('Pay registration error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/institution/mpesa/confirm
router.post('/mpesa/confirm', auth, async (req, res) => {
  try {
    const inst = await Institution.findByIdAndUpdate(
      req.user.id,
      { registrationPaymentSubmitted: true },
      { new: true, select: '-password' }
    );
    res.json({ submitted: true, institution: inst });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
