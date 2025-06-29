import e from 'express';
import admin from 'firebase-admin';

const sendNotification = async (expoPushToken, title, message, data = {}) => {
  const payload = {
    notification: {
      title,
      body: message,
    },
    data,
    token: expoPushToken,
  };

  try {
    const response = await admin.messaging().send(payload);
    console.log('✅ Notification sent:', response);
    return response;
  } catch (err) {
    console.error('❌ Failed to send notification:', err);
    throw err;
  }
};

export default sendNotification;    
