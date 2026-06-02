const express = require('express');
const Institution = require('../models/Institution');
const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Institution.countDocuments();
    const active = await Institution.countDocuments({ serviceActive: true });
    const defaulters = await Institution.countDocuments({ registrationFeePaid: false });
    const disconnected = await Institution.countDocuments({ serviceActive: false, installationFeePaid: true });

    // Monthly revenue: sum all monthly bandwidth charges
    const bandwidthPrices = { '4': 1200, '10': 2000, '20': 3500, '25': 4000, '50': 7000 };
    const activeInstitutions = await Institution.find({ serviceActive: true }, 'currentBandwidth');
    const monthlyRevenue = activeInstitutions.reduce((sum, inst) => {
      return sum + (bandwidthPrices[inst.currentBandwidth] || 0);
    }, 0);

    res.json({ total, active, defaulters, disconnected, monthlyRevenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/bandwidth
router.get('/bandwidth', async (req, res) => {
  try {
    const result = await Institution.aggregate([
      { $match: { currentBandwidth: { $ne: null } } },
      { $group: { _id: '$currentBandwidth', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/types
router.get('/types', async (req, res) => {
  try {
    const result = await Institution.aggregate([
      { $group: { _id: '$institutionType', count: { $sum: 1 } } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/dashboard/recent
router.get('/recent', async (req, res) => {
  try {
    const institutions = await Institution.find({}, 'institutionName institutionType currentBandwidth serviceActive registrationFeePaid createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(institutions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
