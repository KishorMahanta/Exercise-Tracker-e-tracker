const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const exerciseRoutes = require('./routes/exercise.routes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/exercises', exerciseRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: '✅ E-Tracker API is running',
    version: '1.0.0',
    endpoints: {
      exercises: '/api/exercises',
      stats: '/api/exercises/stats/summary'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});


// TEMPORARY: Delete all exercises (remove after testing)
app.delete('/api/exercises/clear-all', async (req, res) => {
  try {
    const Exercise = require('./models/exercise.model');
    const result = await Exercise.deleteMany({});
    res.json({ 
      success: true, 
      message: `Deleted ${result.deletedCount} exercises`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});