const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb } = require('pdf-lib');

class PDFService {
  /**
   * Format ID to 5 digits: ID first, then random digits to fill
   * Examples: ID 1 → "12345", ID 12 → "12345", ID 123 → "12345"
   */
  formatIDNumber(id) {
    const idString = String(id);
    const idLength = idString.length;
    const randomDigitsNeeded = 5 - idLength;
    
    if (randomDigitsNeeded <= 0) {
      // If ID is 5+ digits, return first 5 digits
      return idString.substring(0, 5);
    }
    
    // Generate random digits
    let randomDigits = '';
    for (let i = 0; i < randomDigitsNeeded; i++) {
      randomDigits += Math.floor(Math.random() * 10);
    }
    
    // Combine: ID first, then random digits
    return idString + randomDigits;
  }

  /**
   * Load background image from templates folder
   */
  async loadBackgroundImage() {
    try {
      const templatesDir = path.join(__dirname, '..', 'templates');
      let bgPath = path.join(templatesDir, 'background.png');
      
      // Try PNG first, then JPG
      if (!fs.existsSync(bgPath)) {
        bgPath = path.join(templatesDir, 'background.jpg');
        if (!fs.existsSync(bgPath)) {
          console.warn('Background image not found');
          return null;
        }
      }
      
      const bgBytes = fs.readFileSync(bgPath);
      return bgBytes;
    } catch (error) {
      console.warn('Could not load background image:', error.message);
      return null;
    }
  }

  async generateIDCard(registrationData, photoPath) {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page (ID card size: 500px x 300px at 72 DPI = 500x300 points)
      const page = pdfDoc.addPage([500, 300]);
      
      // Load and embed background image
      const bgBytes = await this.loadBackgroundImage();
      let bgImage = null;
      if (bgBytes) {
        try {
          // Determine file extension by checking which file exists
          const templatesDir = path.join(__dirname, '..', 'templates');
          const bgPngPath = path.join(templatesDir, 'background.png');
          const bgJpgPath = path.join(templatesDir, 'background.jpg');
          
          let bgExtension = '.png';
          if (fs.existsSync(bgPngPath)) {
            bgExtension = '.png';
          } else if (fs.existsSync(bgJpgPath)) {
            bgExtension = '.jpg';
          }
          
          if (bgExtension === '.png') {
            bgImage = await pdfDoc.embedPng(bgBytes);
          } else {
            bgImage = await pdfDoc.embedJpg(bgBytes);
          }
          
          // Draw background image to fill the entire page
          if (bgImage) {
            page.drawImage(bgImage, {
              x: 0,
              y: 0,
              width: page.getWidth(),
              height: page.getHeight(),
            });
          }
        } catch (bgError) {
          console.warn('Error embedding background image:', bgError.message);
        }
      }
      
      // Load and embed the photo
      let photoImage = null;
      if (photoPath && fs.existsSync(photoPath)) {
        const photoBytes = fs.readFileSync(photoPath);
        const imageExtension = path.extname(photoPath).toLowerCase();
        
        if (imageExtension === '.png') {
          photoImage = await pdfDoc.embedPng(photoBytes);
        } else {
          photoImage = await pdfDoc.embedJpg(photoBytes);
        }
      }
      
      // Set up fonts
      const helveticaFont = await pdfDoc.embedFont('Helvetica');
      const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');
      
      // Draw photo (if available) - positioned on the right side (matching template)
      if (photoImage) {
        const photoWidth = 130; // Match template size
        const photoHeight = 160; // Match template size
        const photoX = page.getWidth() - photoWidth - 25; // Right side with padding
        const photoY = page.getHeight() - photoHeight - 25; // Top with padding (adjusted for template)
        
        // Draw white background for photo container
        page.drawRectangle({
          x: photoX - 5,
          y: photoY - 5,
          width: photoWidth + 10,
          height: photoHeight + 10,
          color: rgb(1, 1, 1), // White
          borderColor: rgb(0.9, 0.9, 0.9),
          borderWidth: 1,
        });
        
        page.drawImage(photoImage, {
          x: photoX,
          y: photoY,
          width: photoWidth,
          height: photoHeight,
        });
      }
      
      // Draw text fields - positioned on the left side (matching template)
      const startX = 25; // Left padding
      let currentY = page.getHeight() - 150; // Start from top area (matching template top: 150px)
      const lineHeight = 20;
      const fontSize = 16;
      const labelFontSize = 16;
      
      // Use green color for text to match template (#1A522A = rgb(0.102, 0.322, 0.165))
      const labelColor = rgb(0.102, 0.322, 0.165); // Dark green
      const valueColor = rgb(0.102, 0.322, 0.165); // Same green for values
      
      // Name
      page.drawText('Name:', {
        x: startX,
        y: currentY,
        size: labelFontSize,
        font: helveticaBoldFont,
        color: labelColor,
      });
      page.drawText(registrationData.full_name || '', {
        x: startX + 80,
        y: currentY,
        size: fontSize,
        font: helveticaBoldFont,
        color: valueColor,
      });
      currentY -= lineHeight + 5;
      
      // Company
      page.drawText('Company:', {
        x: startX,
        y: currentY,
        size: labelFontSize,
        font: helveticaBoldFont,
        color: labelColor,
      });
      page.drawText(registrationData.company_name || '', {
        x: startX + 100,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
        color: valueColor,
      });
      currentY -= lineHeight + 5;
      
      // Email
      page.drawText('Email address:', {
        x: startX,
        y: currentY,
        size: labelFontSize,
        font: helveticaBoldFont,
        color: labelColor,
      });
      page.drawText(registrationData.email || '', {
        x: startX + 120,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
        color: valueColor,
      });
      currentY -= lineHeight + 5;
      
      // ID No - formatted to 5 digits
      const formattedID = this.formatIDNumber(registrationData.id || '');
      page.drawText('ID No:', {
        x: startX,
        y: currentY,
        size: labelFontSize,
        font: helveticaBoldFont,
        color: labelColor,
      });
      page.drawText(formattedID, {
        x: startX + 80,
        y: currentY,
        size: fontSize,
        font: helveticaFont,
        color: valueColor,
      });
      
      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();
      
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }
}

module.exports = new PDFService();
