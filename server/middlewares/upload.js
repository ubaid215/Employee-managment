const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const AppError = require('../utils/appError');
const fs = require('fs').promises;

// Configure storage
const multerStorage = multer.memoryStorage();

// File filter for profile images
const profileImageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed for profile images!', 400), false);
  }
};

// File filter for task submissions
const taskFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, WebP images, and PDFs are allowed for task submissions!', 400), false);
  }
};

// Multer configuration for profile images
const uploadProfile = multer({
  storage: multerStorage,
  fileFilter: profileImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Multer configuration for task submissions
const uploadTaskFiles = multer({
  storage: multerStorage,
  fileFilter: taskFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for task files (larger to accommodate PDFs)
    files: 5 // Max 5 files per submission
  }
});

// Process and save profile image
exports.resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const uploadDir = path.join(__dirname, '../../public/uploads/users');
    await fs.mkdir(uploadDir, { recursive: true });

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    const filePath = path.join(uploadDir, req.file.filename);

    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(filePath);

    req.body.profileImage = `/uploads/users/${req.file.filename}`;
    next();
  } catch (err) {
    if (req.file?.filename) {
      try {
        const filePath = path.join(__dirname, '../../public/uploads/users', req.file.filename);
        await fs.unlink(filePath);
      } catch (cleanupErr) {
        console.error('Failed to cleanup processed image:', cleanupErr);
      }
    }
    next(new AppError('Error processing profile image', 500));
  }
};

// Process and save task files
exports.processTaskFiles = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(); // Allow submission without files if not required
  }

  try {
    const uploadDir = path.join(__dirname, '../../public/uploads/tasks');
    await fs.mkdir(uploadDir, { recursive: true });

    // Process each file
    const processedFiles = {};
    for (const file of req.files) {
      const fieldName = file.fieldname;
      const extension = path.extname(file.originalname).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.webp'].includes(extension);
      const filename = `task-${req.user.id}-${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, filename);

      if (isImage) {
        // Resize images
        await sharp(file.buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .toFormat(extension === '.png' ? 'png' : 'jpeg')
          .toFile(filePath);
      } else {
        // Save non-image files (e.g., PDFs) directly
        await fs.writeFile(filePath, file.buffer);
      }

      // Store file metadata
      processedFiles[fieldName] = processedFiles[fieldName] || [];
      processedFiles[fieldName].push({
        filename,
        path: `/uploads/tasks/${filename}`,
        mimetype: file.mimetype,
        size: file.size
      });
    }

    // Attach processed files to req.body.formData
    req.body.formData = req.body.formData || {};
    Object.assign(req.body.formData, processedFiles);

    next();
  } catch (err) {
    // Clean up any saved files on error
    for (const file of req.files || []) {
      if (file.filename) {
        try {
          const filePath = path.join(__dirname, '../../public/uploads/tasks', file.filename);
          await fs.unlink(filePath);
        } catch (cleanupErr) {
          console.error('Failed to cleanup task file:', cleanupErr);
        }
      }
    }
    next(new AppError('Error processing task files', 500));
  }
};

// Export middleware
exports.uploadUserPhoto = uploadProfile.single('profileImage');
exports.uploadTaskFiles = uploadTaskFiles.any();