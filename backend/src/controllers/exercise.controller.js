const Exercise = require('../models/exercise.model');

// Get all exercises with optional filtering
const getExercises = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const exercises = await Exercise.find(query).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single exercise by ID
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new exercise
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Update exercise
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully',
      data: exercise
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Delete exercise
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exercise deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get exercise statistics
const getExerciseStats = async (req, res) => {
  try {
    const stats = await Exercise.aggregate([
      {
        $group: {
          _id: '$category',
          totalExercises: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' },
          avgDuration: { $avg: '$duration' },
          avgCalories: { $avg: '$calories' }
        }
      }
    ]);

    const totalStats = await Exercise.aggregate([
      {
        $group: {
          _id: null,
          totalExercises: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalCalories: { $sum: '$calories' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byCategory: stats,
        overall: totalStats[0] || {
          totalExercises: 0,
          totalDuration: 0,
          totalCalories: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseStats
};