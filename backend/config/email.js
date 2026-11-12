const nodemailer = require('nodemailer');
require('dotenv').config();

// Email configuration - supports both App Passwords (Gmail) and plain passwords (other providers)
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true' || parseInt(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Plain password for most providers, App Password for Gmail
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000, // 60 seconds - increased for slow connections
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000 // 60 seconds - increased for sending attachments
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email transporter verification failed:', error.message);
    console.log('Please check your email configuration in .env file');
  } else {
    console.log('Email transporter is ready to send emails');
  }
});

module.exports = transporter;

