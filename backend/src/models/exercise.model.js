const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      minlength: [2, 'Exercise name must be at least 2 characters'],
      maxlength: [100, 'Exercise name cannot exceed 100 characters']
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes']
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: [0, 'Calories cannot be negative'],
      max: [5000, 'Calories cannot exceed 5000']
    },
    date: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['cardio', 'strength', 'flexibility', 'sports']
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

exerciseSchema.index({ date: -1 });

// Clear existing model if it exists (for hot reload)
if (mongoose.models.Exercise) {
  delete mongoose.models.Exercise;
}

module.exports = mongoose.model('Exercise', exerciseSchema);