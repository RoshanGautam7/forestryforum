require('dotenv').config();

/**
 * Middleware to authenticate requests using PIN from environment variable
 * PIN can be sent as query parameter (?pin=xxxx) or header (X-PIN: xxxx)
 */
const pinAuth = (req, res, next) => {
  const pinFromEnv = process.env.PIN;
  
  // Check if PIN is configured
  if (!pinFromEnv) {
    return res.status(500).json({
      success: false,
      message: 'PIN authentication is not configured on the server'
    });
  }

  // Get PIN from query parameter or header
  const providedPin = req.query.pin || req.headers['x-pin'] || req.headers['pin'];

  // Check if PIN was provided
  if (!providedPin) {
    return res.status(401).json({
      success: false,
      message: 'PIN is required. Provide PIN as query parameter (?pin=xxxx) or header (X-PIN: xxxx)'
    });
  }

  // Validate PIN
  if (providedPin !== pinFromEnv) {
    return res.status(403).json({
      success: false,
      message: 'Invalid PIN. Access denied.'
    });
  }

  // PIN is valid, proceed to next middleware
  next();
};

module.exports = pinAuth;
