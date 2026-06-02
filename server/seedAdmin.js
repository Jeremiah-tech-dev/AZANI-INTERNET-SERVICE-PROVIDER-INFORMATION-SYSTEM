require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Institution = require('./models/Institution');

const ADMIN_EMAIL = 'admin@azani.co.ke';
const ADMIN_PASSWORD = 'Azani@Admin2026!';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const exists = await Institution.findOne({ email: ADMIN_EMAIL });
  if (exists) {
    console.log('Admin already exists.');
    process.exit();
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await Institution.create({
    role: 'admin',
    institutionName: 'Azani Admin',
    email: ADMIN_EMAIL,
    password: hashed,
    institutionType: null,
  });

  console.log('✅ Admin created successfully!');
  console.log(`   Email   : ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
