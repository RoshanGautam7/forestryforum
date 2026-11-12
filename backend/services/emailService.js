const transporter = require('../config/email');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class EmailService {
  async sendThankYouEmail(email, fullName, pdfBuffer) {
    try {
      const attachmentsDir = process.env.EMAIL_ATTACHMENTS_DIR || 'email_attachments';
      const attachments = [];

      // Get all files from attachments directory
      if (fs.existsSync(attachmentsDir)) {
        const files = fs.readdirSync(attachmentsDir);
        files.forEach((file) => {
          const filePath = path.join(attachmentsDir, file);
          if (fs.statSync(filePath).isFile()) {
            attachments.push({
              filename: file,
              path: filePath
            });
          }
        });
      }

      // Add ID card PDF to attachments
      if (pdfBuffer) {
        attachments.push({
          filename: `ID-Card-${fullName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBuffer
        });
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Thank You for Your Registration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Thank You, ${fullName}!</h2>
            <p>We have successfully received your registration. We appreciate your interest and will be in touch soon.</p>
            <p>Please find your ID card attached to this email.</p>
            <p>Best regards,<br>PNG DHL Forestry</p>
          </div>
        `,
        attachments: attachments
      };

      console.log('Email configuration check:');
      console.log('- From:', process.env.EMAIL_FROM);
      console.log('- To:', email);
      console.log('- Host:', process.env.EMAIL_HOST);
      console.log('- Port:', process.env.EMAIL_PORT);
      
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully. Message ID:', result.messageId);
      return true;
    } catch (error) {
      console.error('Detailed email error:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to send thank you email: ${error.message} (Code: ${error.code || 'N/A'})`);
    }
  }

  async sendIDCardEmail(fullName, registrationData, pdfBuffer) {
    try {
      // Get email addresses from EMAIL_TO env variable (comma-separated)
      const emailTo = process.env.EMAIL_TO;
      
      if (!emailTo) {
        console.warn('EMAIL_TO is not set in .env file. Skipping ID card email notification.');
        return true; // Don't fail if EMAIL_TO is not set
      }

      // Split comma-separated emails and trim whitespace
      const recipientEmails = emailTo.split(',').map(email => email.trim()).filter(email => email.length > 0);

      if (recipientEmails.length === 0) {
        console.warn('No valid email addresses found in EMAIL_TO. Skipping ID card email notification.');
        return true;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: recipientEmails.join(','), // Send to all addresses in EMAIL_TO
        subject: `New Registration - ID Card for ${fullName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">New Registration Received</h2>
            <p>A new registration has been completed. Please find the ID card attached to this email.</p>
            
            <h3 style="color: #555; margin-top: 30px;">Registration Summary:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Full Name:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.full_name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.email}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Phone Number:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.phone_number}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Company Name:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.company_name}</td>
              </tr>
              <tr style="background-color: #f5f5f5;">
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Type:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.business_type}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>Business Address:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${registrationData.business_address}</td>
              </tr>
            </table>
            
            <p style="margin-top: 30px;">Best regards,<br>PNG DHL Forestry</p>
          </div>
        `,
        attachments: [
          {
            filename: `ID-Card-${fullName.replace(/\s+/g, '-')}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      console.log('ID Card Email configuration check:');
      console.log('- From:', process.env.EMAIL_FROM);
      console.log('- To:', recipientEmails.join(', '));
      console.log('- Host:', process.env.EMAIL_HOST);
      console.log('- Port:', process.env.EMAIL_PORT);
      
      const result = await transporter.sendMail(mailOptions);
      console.log('ID Card email sent successfully. Message ID:', result.messageId);
      return true;
    } catch (error) {
      console.error('Detailed ID card email error:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        message: error.message,
        stack: error.stack
      });
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        throw new Error(`Failed to send ID card email: Timeout - The email server took too long to respond. This may be due to a large PDF attachment or slow network connection. Please try again.`);
      }
      throw new Error(`Failed to send ID card email: ${error.message} (Code: ${error.code || 'N/A'})`);
    }
  }
}

module.exports = new EmailService();

