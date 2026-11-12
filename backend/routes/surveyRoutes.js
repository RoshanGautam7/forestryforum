const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/surveyController');
const pinAuth = require('../middleware/pinAuth');

// Create survey (public - no auth required)
router.post('/survey', surveyController.create.bind(surveyController));

// Get all surveys - requires PIN authentication
router.get('/surveys', pinAuth, surveyController.getAll.bind(surveyController));

// Get survey by ID - requires PIN authentication
router.get('/surveys/:id', pinAuth, surveyController.getById.bind(surveyController));

module.exports = router;

