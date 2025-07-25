const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const AppError = require('../utils/appError');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

// File filter to allow only images
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to resize and save image
const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  // Create unique filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(__dirname, '../public/uploads/users');
  require('fs').mkdirSync(uploadDir, { recursive: true });

  // Resize and save image
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadDir, req.file.filename));

  next();
};

module.exports = {
  uploadUserPhoto: upload.single('profileImage'),
  resizeUserPhoto
};