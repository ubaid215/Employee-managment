const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const AppError = require('../utils/appError');
const fs = require('fs').promises;

// Configure storage and filtering
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Process and save the uploaded image
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../public/uploads/users');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    const filePath = path.join(uploadDir, req.file.filename);

    // Process image
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ 
        quality: 90,
        mozjpeg: true 
      })
      .toFile(filePath);

    // Set the image URL for the controller
    req.body.profileImage = `/uploads/users/${req.file.filename}`;
    next();

  } catch (err) {
    // Clean up if processing failed
    if (req.file?.filename) {
      try {
        const filePath = path.join(__dirname, '../../public/uploads/users', req.file.filename);
        await fs.unlink(filePath);
      } catch (cleanupErr) {
        console.error('Failed to cleanup processed image:', cleanupErr);
      }
    }
    next(new AppError('Error processing image', 500));
  }
};

exports.uploadUserPhoto = upload.single('profileImage');