const express = require('express');
const Institution = require('../models/Institution');
const Payment = require('../models/Payment');
const router = express.Router();

const BW_PRICES = { '4': 1200, '10': 2000, '20': 3500, '25': 4000, '50': 7000 };
const getLANCost = n => n <= 0 ? 0 : n <= 10 ? 10000 : n <= 20 ? 20000 : n <= 40 ? 30000 : 40000;

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const all = await Institution.find({ role: 'institution' });
    const total = all.length;
    const active = all.filter(i => i.serviceActive).length;
    const pendingActivation = all.filter(i => i.registrationPaymentSubmitted && !i.registrationFeePaid).length;
    const defaulters = all.filter(i => i.registrationFeePaid && !i.monthlyFeePaid && i.serviceActive).length;
    const disconnected = all.filter(i => !i.serviceActive && i.registrationFeePaid).length;
    const monthlyRevenue = all.filter(i => i.serviceActive).reduce((s, i) => s + (BW_PRICES[i.currentBandwidth] || 0), 0);
    res.json({ total, active, defaulters, disconnected, monthlyRevenue, pendingActivation });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/institutions
router.get('/institutions', async (req, res) => {
  try {
    const institutions = await Institution.find({ role: 'institution' }, '-password').sort({ createdAt: -1 });
    res.json(institutions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/infrastructure
router.get('/infrastructure', async (req, res) => {
  try {
    const institutions = await Institution.find({ role: 'institution' },
      'institutionName institutionType numberOfUsers computersPurchased lanNodesPurchased hasLAN isReadyForConnectivity serviceActive registrationFeePaid'
    ).sort({ createdAt: -1 });
    res.json(institutions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/bandwidth
router.get('/bandwidth', async (req, res) => {
  try {
    const result = await Institution.aggregate([
      { $match: { role: 'institution', currentBandwidth: { $ne: null } } },
      { $group: { _id: '$currentBandwidth', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/types
router.get('/types', async (req, res) => {
  try {
    const result = await Institution.aggregate([
      { $match: { role: 'institution' } },
      { $group: { _id: '$institutionType', count: { $sum: 1 } } }
    ]);
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/recent
router.get('/recent', async (req, res) => {
  try {
    const institutions = await Institution.find({ role: 'institution' },
      'institutionName institutionType currentBandwidth serviceActive registrationFeePaid registrationPaymentSubmitted createdAt'
    ).sort({ createdAt: -1 }).limit(10);
    res.json(institutions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/payments
router.get('/payments', async (req, res) => {
  try {
    const all = await Institution.find({ role: 'institution' }, '-password').sort({ createdAt: -1 });
    const payments = all.map(inst => {
      const monthlyFee = BW_PRICES[inst.currentBandwidth] || 0;
      const overdueFine = inst.monthlyFeePaid ? 0 : parseFloat((monthlyFee * 0.15).toFixed(2));
      const lanCost = getLANCost(inst.lanNodesPurchased || 0);
      const computerCost = (inst.computersPurchased || 0) * 40000;
      const installationFee = inst.isReadyForConnectivity ? 10000 : 0;
      return {
        _id: inst._id,
        institutionName: inst.institutionName,
        institutionType: inst.institutionType,
        registrationFee: 8500,
        registrationFeePaid: inst.registrationFeePaid,
        registrationPaymentSubmitted: inst.registrationPaymentSubmitted,
        installationFee,
        installationFeePaid: inst.installationFeePaid,
        monthlyFee,
        monthlyFeePaid: inst.monthlyFeePaid || false,
        overdueFine,
        reconnectionFee: inst.needsReconnection ? 1000 : 0,
        computerCost,
        lanCost,
        bandwidth: inst.currentBandwidth,
        serviceActive: inst.serviceActive,
        totalInstallation: installationFee + computerCost + lanCost,
      };
    });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/services
router.get('/services', async (req, res) => {
  try {
    const all = await Institution.find({ role: 'institution' },
      'institutionName institutionType currentBandwidth serviceActive registrationFeePaid installationFeePaid monthlyFeePaid registrationPaymentSubmitted'
    ).sort({ institutionName: 1 });
    res.json(all);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/defaulters
router.get('/defaulters', async (req, res) => {
  try {
    const all = await Institution.find({
      role: 'institution', registrationFeePaid: true, serviceActive: true
    }, 'institutionName institutionType email phoneNumber currentBandwidth monthlyFeePaid createdAt').sort({ createdAt: -1 });
    const defaulters = all.map(inst => ({
      ...inst._doc,
      monthlyFee: BW_PRICES[inst.currentBandwidth] || 0,
      overdueFine: parseFloat(((BW_PRICES[inst.currentBandwidth] || 0) * 0.15).toFixed(2))
    }));
    res.json(defaulters);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/disconnections
router.get('/disconnections', async (req, res) => {
  try {
    const all = await Institution.find({
      role: 'institution', serviceActive: false, registrationFeePaid: true
    }, 'institutionName institutionType email phoneNumber currentBandwidth needsReconnection disconnectedAt updatedAt').sort({ updatedAt: -1 });
    res.json(all);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/reports
router.get('/reports', async (req, res) => {
  try {
    const all = await Institution.find({ role: 'institution' });
    const byType = {};
    all.forEach(inst => {
      const t = inst.institutionType || 'unknown';
      if (!byType[t]) byType[t] = { count: 0, monthlyTotal: 0, finesTotal: 0, reconnectionTotal: 0 };
      const fee = BW_PRICES[inst.currentBandwidth] || 0;
      byType[t].count++;
      byType[t].monthlyTotal += fee;
      if (!inst.monthlyFeePaid && inst.serviceActive) byType[t].finesTotal += fee * 0.15;
      if (inst.needsReconnection) byType[t].reconnectionTotal += 1000;
    });

    const totalInstallation = all.reduce((s, i) => {
      const comp = (i.computersPurchased || 0) * 40000;
      const lan = getLANCost(i.lanNodesPurchased || 0);
      const inst = i.isReadyForConnectivity ? 10000 : 0;
      return s + comp + lan + inst;
    }, 0);

    const totalUpgradeRevenue = all
      .filter(i => i.serviceActive && i.currentBandwidth)
      .reduce((s, i) => s + ((BW_PRICES[i.currentBandwidth] || 0) * 0.9), 0);

    res.json({ byType, totalInstallation, totalUpgradeRevenue, allCount: all.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/dashboard/institutions/:id/activate
router.put('/institutions/:id/activate', async (req, res) => {
  try {
    const { registrationFeePaid, serviceActive, currentBandwidth, installationFeePaid } = req.body;
    const prev = await Institution.findById(req.params.id);

    // Record registration payment in ledger if newly marked paid
    if (registrationFeePaid && prev && !prev.registrationFeePaid) {
      await Payment.create({
        institution: prev._id,
        institutionName: prev.institutionName,
        type: 'registration',
        amount: 8500,
        method: 'cash',
      });
    }
    // Record installation payment in ledger if newly marked paid
    if (installationFeePaid && prev && !prev.installationFeePaid) {
      await Payment.create({
        institution: prev._id,
        institutionName: prev.institutionName,
        type: 'installation',
        amount: 10000,
        method: 'cash',
      });
    }

    const inst = await Institution.findByIdAndUpdate(req.params.id,
      { registrationFeePaid, serviceActive, currentBandwidth, installationFeePaid },
      { new: true, select: '-password' }
    );
    res.json(inst);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/dashboard/payment-history/:id — full ledger for one institution
router.get('/payment-history/:id', async (req, res) => {
  try {
    const payments = await Payment.find({ institution: req.params.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
