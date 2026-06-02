const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Institution = require('../models/Institution');
const router = express.Router();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

// POST /api/orders — institution places a bandwidth order
router.post('/', auth, async (req, res) => {
  try {
    const { bandwidth, monthlyFee, discountedFee, currentBandwidth } = req.body;
    const inst = await Institution.findById(req.user.id);
    if (!inst) return res.status(404).json({ message: 'Institution not found' });

  // Enforce: discount only applies when upgrading to higher bandwidth
    const isUpgrade = !inst.currentBandwidth || parseInt(bandwidth) > parseInt(inst.currentBandwidth);
    const finalDiscountedFee = isUpgrade ? discountedFee : monthlyFee;

    const order = await Order.create({
      institution: inst._id,
      institutionName: inst.institutionName,
      institutionType: inst.institutionType,
      contactPersonName: inst.contactPersonName,
      phoneNumber: inst.phoneNumber,
      email: inst.email,
      bandwidth,
      monthlyFee,
      discountedFee: finalDiscountedFee,
      currentBandwidth,
    });

    res.status(201).json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders/unread-count — must be BEFORE /:id routes
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Order.countDocuments({ read: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/orders/:id/status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status, read: true }, { new: true });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
