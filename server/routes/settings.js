const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../config/mpesa.json');

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// GET /api/settings/mpesa
router.get('/mpesa', adminAuth, (req, res) => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return res.json({});
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/settings/mpesa
router.put('/mpesa', adminAuth, (req, res) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: 'Saved successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
