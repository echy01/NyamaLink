import express from 'express';
import at from '../config/africastalking.js';
import OTP from '../models/otpModel.js';

const router = express.Router();

// POST /api/otp/send
router.post('/send', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.findOneAndUpdate(
    { phoneNumber },
    { code: otp, expiresAt },
    { upsert: true, new: true }
  );

  try {
    console.log("📤 Sending OTP to:", phoneNumber);
    await at.SMS.send({
      to: [phoneNumber],
      message: `Your NyamaLink OTP code is: ${otp}`,
    });
    res.json({ message: 'OTP sent successfully.' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP.' });
  }
});

// POST /api/otp/verify
router.post('/verify', async (req, res) => {
  const { phoneNumber, code } = req.body;
  if (!phoneNumber || !code) return res.status(400).json({ message: 'Phone number and code required.' });

  const record = await OTP.findOne({ phoneNumber, code });
  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP.' });
  }

  await OTP.deleteOne({ _id: record._id }); // Clean up used OTP
  res.json({ message: 'OTP verified successfully.' });
});

export default router;
