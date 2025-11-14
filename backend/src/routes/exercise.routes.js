const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseStats
} = require('../controllers/exercise.controller');

// Stats route (must be before /:id route)
router.get('/stats/summary', getExerciseStats);

// CRUD routes
router.route('/')
  .get(getExercises)
  .post(createExercise);

router.route('/:id')
  .get(getExerciseById)
  .put(updateExercise)
  .delete(deleteExercise);

module.exports = router;