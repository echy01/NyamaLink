import express from 'express';
import sendNotification from '../utils/sendNotification.js';

const router = express.Router();

router.post('/send-test-notification', async (req, res) => {
  const { token, title, message } = req.body;

  if (!token || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sendNotification(token, title, message);
    res.status(200).json({ success: true, message: 'Notification sent' });
  } catch (err) {
    res.status(500).json({ error: 'Notification failed' });
  }
});

export default router;
