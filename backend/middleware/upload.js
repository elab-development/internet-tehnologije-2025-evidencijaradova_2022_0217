import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type'), false);
    }

    cb(null, true);
  },
});