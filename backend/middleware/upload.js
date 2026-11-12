const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists (use absolute path for cPanel compatibility)
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadDir = path.isAbsolute(uploadDir) ? uploadDir : path.join(__dirname, '..', uploadDir);

try {
  if (!fs.existsSync(absoluteUploadDir)) {
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
  }
  // Also ensure photos subdirectory exists
  const photosDir = path.join(absoluteUploadDir, 'photos');
  if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
  }
} catch (error) {
  console.error('Error creating upload directory:', error);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const absoluteUploadDir = path.isAbsolute(uploadDir) ? uploadDir : path.join(__dirname, '..', uploadDir);
    const photosDir = path.join(absoluteUploadDir, 'photos');
    
    // Ensure directory exists
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }
    
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;

