const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const upload = require('../middleware/upload');
const pinAuth = require('../middleware/pinAuth');

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.message.includes('Only image files are allowed')) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  next();
};

// CRUD routes
// GET all registrations - requires PIN authentication
router.get('/registrations', pinAuth, registrationController.getAll.bind(registrationController));
router.get('/registrations/:id', registrationController.getById.bind(registrationController));
router.put('/registrations/:id', upload.single('photo'), handleMulterError, registrationController.update.bind(registrationController));
router.delete('/registrations/:id', registrationController.delete.bind(registrationController));
router.get('/registrations/:id/preview', registrationController.previewIDCard.bind(registrationController));

// Test endpoint to verify POST works
router.post('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'POST endpoint is working',
    body: req.body,
    hasFile: !!req.file
  });
});

// Registration route
router.post('/register', upload.single('photo'), handleMulterError, registrationController.register.bind(registrationController));

module.exports = router;

