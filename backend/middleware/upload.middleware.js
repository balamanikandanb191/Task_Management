// middleware/upload.middleware.js — Multer file upload config
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ALLOWED_EXTENSIONS } = require('../utils/constants');
const { sendError } = require('../utils/helpers');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = req.params.taskId
      ? `task_${req.params.taskId}`
      : req.params.projectId
      ? `project_${req.params.projectId}`
      : 'file';
    cb(null, `${prefix}_${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // Hardcoded 100MB for absolute reliability
});

module.exports = upload;
