const Registration = require('../models/Registration');
const pdfService = require('../services/pdfService'); // pdf-lib service
const emailService = require('../services/emailService');
const path = require('path');
const fs = require('fs');

class RegistrationController {

  prepareTemplateData(registrationData, photoPath) {
    // Convert photo to base64 data URI
    let profilePhotoDataUri = '';
    if (photoPath && fs.existsSync(photoPath)) {
      const photoBuffer = fs.readFileSync(photoPath);
      const photoExtension = path.extname(photoPath).toLowerCase();
      const mimeType = photoExtension === '.png' ? 'image/png' : 
                      photoExtension === '.jpg' || photoExtension === '.jpeg' ? 'image/jpeg' : 
                      photoExtension === '.gif' ? 'image/gif' : 'image/jpeg';
      profilePhotoDataUri = `data:${mimeType};base64,${photoBuffer.toString('base64')}`;
    }

    return {
      full_name: (registrationData.full_name || '').trim(),
      email: (registrationData.email || '').trim(),
      company_name: (registrationData.company_name || '').trim(),
      phone: (registrationData.phone_number || '').trim(),
      profile_photo: profilePhotoDataUri,
      business_type: registrationData.business_type || '',
      business_address: registrationData.business_address || ''
    };
  }

  // Get all registrations
  async getAll(req, res) {
    try {
      const registrations = await Registration.findAll({
        order: [['created_at', 'DESC']]
      });
      res.status(200).json({
        success: true,
        data: registrations
      });
    } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch registrations',
        error: error.message
      });
    }
  }

  // Get registration by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const registration = await Registration.findByPk(id);
      if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }
      res.status(200).json({ success: true, data: registration });
    } catch (error) {
      console.error('Error fetching registration:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch registration', error: error.message });
    }
  }

  // Register new user
  async register(req, res) {
    try {
      console.log('Registration request received');
      console.log('Body:', req.body);
      console.log('File:', req.file ? 'Present' : 'Missing');
      
      const { full_name, phone_number, email, company_name, business_type, business_address } = req.body;

      if (!full_name || !phone_number || !email || !company_name || !business_type || !business_address) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Photo is required' });
      }

      const photoPath = req.file.path;
      console.log('Photo saved at:', photoPath);

      // Store photo path as relative path (uploads/photos/filename.jpg)
      const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
      let relativePhotoPath = photoPath;
      
      // Convert absolute path to relative path if needed
      if (path.isAbsolute(photoPath)) {
        const photosDir = path.join(__dirname, '..', uploadsDir, 'photos');
        const fileName = path.basename(photoPath);
        relativePhotoPath = `${uploadsDir}/photos/${fileName}`;
      } else if (!photoPath.startsWith(uploadsDir)) {
        // If path doesn't start with uploads/, add it
        relativePhotoPath = photoPath.startsWith('/') 
          ? photoPath.substring(1) 
          : `${uploadsDir}/photos/${path.basename(photoPath)}`;
      }

      // Create registration
      const registration = await Registration.create({
        full_name,
        phone_number,
        email,
        company_name,
        business_type,
        business_address,
        photo_path: relativePhotoPath
      });

      // Resolve photo path for PDF generation (handle both absolute and relative)
      let actualPhotoPath = photoPath;
      if (!path.isAbsolute(actualPhotoPath)) {
        actualPhotoPath = path.join(__dirname, '..', actualPhotoPath);
      }
      
      // Generate PDF using pdf-lib
      const pdfBuffer = await pdfService.generateIDCard(registration.dataValues, actualPhotoPath);

      // Save PDF to uploads/pdfs
      const pdfsDir = path.join(__dirname, '..', uploadsDir, 'pdfs');
      if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });

      const pdfFileName = `ID-Card-${registration.id}-${Date.now()}.pdf`;
      const pdfPath = path.join(pdfsDir, pdfFileName);
      fs.writeFileSync(pdfPath, pdfBuffer);

      registration.pdf_path = `${uploadsDir}/pdfs/${pdfFileName}`;
      await registration.save();

      // Send emails with detailed error logging
      let emailErrors = [];
      
      try { 
        console.log('Attempting to send thank you email to:', email);
        await emailService.sendThankYouEmail(email, full_name, pdfBuffer);
        console.log('Thank you email sent successfully to:', email);
      } catch(e){ 
        const errorDetails = {
          type: 'Thank You Email',
          recipient: email,
          error: e.message,
          stack: e.stack,
          fullError: e
        };
        console.error('=== ERROR SENDING THANK YOU EMAIL ===');
        console.error('Recipient:', email);
        console.error('Error Message:', e.message);
        console.error('Error Stack:', e.stack);
        console.error('Full Error Object:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
        console.error('=====================================');
        emailErrors.push(errorDetails);
      }
      
      try { 
        console.log('Attempting to send ID card notification email');
        await emailService.sendIDCardEmail(full_name, registration.dataValues, pdfBuffer);
        console.log('ID card notification email sent successfully');
      } catch(e){ 
        const errorDetails = {
          type: 'ID Card Notification Email',
          recipient: process.env.EMAIL_TO,
          error: e.message,
          stack: e.stack,
          fullError: e
        };
        console.error('=== ERROR SENDING ID CARD EMAIL ===');
        console.error('Recipients:', process.env.EMAIL_TO);
        console.error('Error Message:', e.message);
        console.error('Error Stack:', e.stack);
        console.error('Full Error Object:', JSON.stringify(e, Object.getOwnPropertyNames(e)));
        console.error('===================================');
        emailErrors.push(errorDetails);
      }
      
      // Log summary if there were email errors
      if (emailErrors.length > 0) {
        console.error('=== EMAIL SENDING SUMMARY ===');
        console.error(`Total email errors: ${emailErrors.length}`);
        emailErrors.forEach((err, index) => {
          console.error(`Error ${index + 1}: ${err.type} - ${err.error}`);
        });
        console.error('Registration was saved successfully despite email errors.');
        console.error('============================');
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful! Check your email for the ID card.',
        data: { id: registration.id, full_name: registration.full_name, email: registration.email }
      });

    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed', 
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    }
  }

  // Update registration
  async update(req, res) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
      const { id } = req.params;
      const { full_name, phone_number, email, company_name, business_type, business_address } = req.body;

      const registration = await Registration.findByPk(id);
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      // Track if any data changed
      let shouldRegeneratePDF = false;
      
      // Update fields and check for changes
      if (full_name && registration.full_name !== full_name) {
        registration.full_name = full_name;
        shouldRegeneratePDF = true;
      }
      if (phone_number && registration.phone_number !== phone_number) {
        registration.phone_number = phone_number;
        shouldRegeneratePDF = true;
      }
      if (email && registration.email !== email) {
        registration.email = email;
        shouldRegeneratePDF = true;
      }
      if (company_name && registration.company_name !== company_name) {
        registration.company_name = company_name;
        shouldRegeneratePDF = true;
      }
      if (business_type && registration.business_type !== business_type) {
        registration.business_type = business_type;
        shouldRegeneratePDF = true;
      }
      if (business_address && registration.business_address !== business_address) {
        registration.business_address = business_address;
        shouldRegeneratePDF = true;
      }

      // Handle photo update if provided
      if (req.file) {
        // Delete old photo if exists
        const oldPhotoPath = registration.photo_path;
        if (oldPhotoPath) {
          // Try both absolute and relative paths
          const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
          const absoluteOldPath = path.isAbsolute(oldPhotoPath) 
            ? oldPhotoPath 
            : path.join(__dirname, '..', oldPhotoPath);
          
          if (fs.existsSync(absoluteOldPath)) {
            fs.unlinkSync(absoluteOldPath);
          } else if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        
        // Store as relative path
        const fileName = path.basename(req.file.path);
        registration.photo_path = `${uploadsDir}/photos/${fileName}`;
        shouldRegeneratePDF = true;
      }

      await registration.save();

      // Regenerate PDF if data or photo changed
      if (shouldRegeneratePDF) {
        try {
          // Delete old PDF if exists
          if (registration.pdf_path && fs.existsSync(registration.pdf_path)) {
            fs.unlinkSync(registration.pdf_path);
          }

          // Resolve photo path (handle both absolute and relative)
          let actualPhotoPath = registration.photo_path;
          if (!path.isAbsolute(actualPhotoPath)) {
            actualPhotoPath = path.join(__dirname, '..', actualPhotoPath);
          }
          
          // Generate new PDF using pdf-lib
          const pdfBuffer = await pdfService.generateIDCard(registration.dataValues, actualPhotoPath);
          
          // Save new PDF in uploads folder
          const pdfsDir = path.join(__dirname, '..', uploadsDir, 'pdfs');
          if (!fs.existsSync(pdfsDir)) {
            fs.mkdirSync(pdfsDir, { recursive: true });
          }
          const pdfFileName = `ID-Card-${registration.id}-${Date.now()}.pdf`;
          const pdfPath = path.join(pdfsDir, pdfFileName);
          fs.writeFileSync(pdfPath, pdfBuffer);

          // Update registration with new PDF path
          registration.pdf_path = `${uploadsDir}/pdfs/${pdfFileName}`;
          await registration.save();
        } catch (pdfError) {
          console.error('Error regenerating PDF:', pdfError);
          // Continue even if PDF regeneration fails
        }
      }

      res.status(200).json({
        success: true,
        message: 'Registration updated successfully',
        data: registration
      });
    } catch (error) {
      console.error('Error updating registration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update registration',
        error: error.message
      });
    }
  }

  // Delete registration
  async delete(req, res) {
    try {
      const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
      const { id } = req.params;
      const registration = await Registration.findByPk(id);
      
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      // Delete photo file if exists
      if (registration.photo_path) {
        let photoFilePath = registration.photo_path;
        
        // Convert relative path to absolute if needed
        if (!path.isAbsolute(photoFilePath)) {
          photoFilePath = path.join(__dirname, '..', photoFilePath);
        }
        
        if (fs.existsSync(photoFilePath)) {
          fs.unlinkSync(photoFilePath);
        }
      }

      // Delete PDF file if exists
      if (registration.pdf_path) {
        let pdfFilePath = registration.pdf_path;
        
        // Convert relative path to absolute if needed
        if (!path.isAbsolute(pdfFilePath)) {
          pdfFilePath = path.join(__dirname, '..', pdfFilePath);
        }
        
        if (fs.existsSync(pdfFilePath)) {
          fs.unlinkSync(pdfFilePath);
        }
      }

      await registration.destroy();

      res.status(200).json({
        success: true,
        message: 'Registration deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting registration:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete registration',
        error: error.message
      });
    }
  }

  // Preview / Generate ID Card PDF
  async previewIDCard(req, res) {
    try {
      const { id } = req.params;
      const registration = await Registration.findByPk(id);
      if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

      let pdfBuffer;

      if (registration.pdf_path && fs.existsSync(registration.pdf_path)) {
        pdfBuffer = fs.readFileSync(registration.pdf_path);
      } else {
        // Generate PDF on-the-fly
        // Resolve photo path (handle both absolute and relative)
        const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
        let actualPhotoPath = registration.photo_path;
        if (!path.isAbsolute(actualPhotoPath)) {
          actualPhotoPath = path.join(__dirname, '..', actualPhotoPath);
        }
        
        if (!fs.existsSync(actualPhotoPath)) {
          return res.status(404).json({ success: false, message: 'Photo file not found' });
        }

        pdfBuffer = await pdfService.generateIDCard(registration.dataValues, actualPhotoPath);

        // Save PDF
        const pdfsDir = path.join(__dirname, '..', uploadsDir, 'pdfs');
        if (!fs.existsSync(pdfsDir)) fs.mkdirSync(pdfsDir, { recursive: true });

        const pdfFileName = `ID-Card-${registration.id}-${Date.now()}.pdf`;
        const pdfPath = path.join(pdfsDir, pdfFileName);
        fs.writeFileSync(pdfPath, pdfBuffer);

        registration.pdf_path = `${uploadsDir}/pdfs/${pdfFileName}`;
        await registration.save();
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="ID-Card-${registration.full_name.replace(/\s+/g, '-')}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Error generating ID card:', error);
      res.status(500).json({ success: false, message: 'Failed to generate ID card', error: error.message });
    }
  }
}

module.exports = new RegistrationController();
