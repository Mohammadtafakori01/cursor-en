const express = require('express');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Simple in-memory OTP store
let otpRecord = null;

const app = express();
app.use(express.json());

const generateOtp = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');

app.post('/send-otp', (req, res) => {
  const otp = generateOtp();
  otpRecord = {
    otp,
    createdAt: Date.now()
  };

  res.json({
    otp,
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000)
  });
});

app.get('/send-otp', (req, res) => {
  if (!otpRecord) {
    return res.status(404).json({ error: 'No OTP generated yet.' });
  }

  const age = Date.now() - otpRecord.createdAt;
  const remaining = Math.max(0, OTP_TTL_MS - age);

  if (remaining === 0) {
    otpRecord = null;
    return res.status(410).json({ error: 'OTP expired.' });
  }

  res.json({
    otp: otpRecord.otp,
    expiresInSeconds: Math.floor(remaining / 1000)
  });
});

app.listen(PORT, () => {
  console.log(`OTP backend listening on port ${PORT}`);
});
