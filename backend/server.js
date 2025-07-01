import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/authroutes.js';
import agentroutes from './routes/agentroutes.js';
import butcherroutes from './routes/butcherroutes.js';
import customerroutes from './routes/customerroutes.js'; 
import paymentRoutes from './routes/paymentroutes.js'; 
import purchaseroutes from './routes/purchaseroutes.js'; 
import notificationRoutes from './routes/notificationRoutes.js';
import otpRoutes from './routes/otproutes.js';
import adminRoutes from './routes/adminroutes.js'; 
import { sms } from './utils/africastalking.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
const server = createServer(app);

// ✅ Add Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// ✅ Attach io to app so it's accessible in controllers
app.set('io', io);

// ✅ Basic socket connection log
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

    socket.on('trigger_test_notification', () => {
    io.emit('new_notification', {
      title: '🚨 Test Alert',
      message: 'This is a test notification!',
      timestamp: new Date(),
      type: 'info',
      read: false,
    });
  });

  socket.on('join_room', (userId) => {
  if (userId) {
    socket.join(userId);
    console.log(`🧩 Socket ${socket.id} joined room: ${userId}`);
  }
});

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected locally'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/agent', agentroutes);
app.use('/api/butcher', butcherroutes);
app.use('/api/customer', customerroutes); 
app.use('/api/payment', paymentRoutes);
app.use('/api/purchase', purchaseroutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);

app.set('africasTalkingSms', sms);

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Use `server.listen` instead of `app.listen`
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on `);
});
