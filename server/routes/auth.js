const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Institution = require('../models/Institution');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { institutionName, institutionType, contactPersonName, email, phoneNumber, password } = req.body;

    const exists = await Institution.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const institution = await Institution.create({
      institutionName, institutionType, contactPersonName, email, phoneNumber, password: hashed
    });

    const token = jwt.sign({ id: institution._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, institution: { id: institution._id, institutionName, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const institution = await Institution.findOne({ email });
    if (!institution) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, institution.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: institution._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, institution: { id: institution._id, institutionName: institution.institutionName, email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
