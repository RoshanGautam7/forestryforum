const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const pinAuth = require('../middleware/pinAuth');

// Create feedback (public - no auth required)
router.post('/feedback', feedbackController.create.bind(feedbackController));

// Get all feedbacks - requires PIN authentication
router.get('/feedbacks', pinAuth, feedbackController.getAll.bind(feedbackController));

// Get feedback by ID - requires PIN authentication
router.get('/feedbacks/:id', pinAuth, feedbackController.getById.bind(feedbackController));

// Delete feedback - requires PIN authentication
router.delete('/feedbacks/:id', pinAuth, feedbackController.delete.bind(feedbackController));

// Mark feedbacks as important (bulk) - requires PIN authentication
router.put('/feedbacks/mark-important', pinAuth, feedbackController.markAsImportant.bind(feedbackController));

module.exports = router;

