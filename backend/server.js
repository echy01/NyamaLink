import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authroutes.js';
import agentroutes from './routes/agentroutes.js';
import butcherroutes from './routes/butcherroutes.js';
import customerroutes from './routes/customerroutes.js'; 
import paymentRoutes from './routes/paymentroutes.js'; 
import purchaseroutes from './routes/purchaseroutes.js'; 
import dotenv from 'dotenv';
dotenv.config();

console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

