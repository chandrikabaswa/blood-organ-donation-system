const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDB } = require('./utils/db');
const authRoutes = require('./routes/authRoutes');
const donorRoutes = require('./routes/donorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (and any origin during development)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Body parser
app.use(express.json());

// Database connection check (connects to MongoDB if MONGO_URI is defined, else runs mock store)
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Blood Donation Management System API',
    time: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error occurred.',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🩸 Blood Donation Management System Backend Running`);
  console.log(`📍 Port: http://localhost:${PORT}`);
  console.log(`👤 Demo Donor:    donor@demo.com    / password123`);
  console.log(`🏥 Demo Hospital: hospital@demo.com / password123`);
  console.log(`====================================================`);
});
