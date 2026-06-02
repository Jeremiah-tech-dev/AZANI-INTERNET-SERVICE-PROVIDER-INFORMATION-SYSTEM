const axios = require('axios');

const DARAJA_BASE = 'https://sandbox.safaricom.co.ke';

// Get OAuth token
async function getToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const res = await axios.get(`${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` }
  });
  return res.data.access_token;
}

// Generate password (Base64 of shortcode + passkey + timestamp)
function getPassword(timestamp) {
  const raw = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(raw).toString('base64');
}

// Format timestamp: YYYYMMDDHHmmss
function getTimestamp() {
  return new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
}

// Normalize phone: 07XX -> 2547XX
function formatPhone(phone) {
  const cleaned = phone.replace(/\s+/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('0')) return '254' + cleaned.slice(1);
  if (cleaned.startsWith('254')) return cleaned;
  return '254' + cleaned;
}

// STK Push
async function stkPush(phone, amount, accountRef, description) {
  const token = await getToken();
  const timestamp = getTimestamp();
  const password = getPassword(timestamp);

  const res = await axios.post(
    `${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formatPhone(phone),
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formatPhone(phone),
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountRef,
      TransactionDesc: description
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

module.exports = { stkPush };
