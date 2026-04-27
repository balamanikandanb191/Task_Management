// services/storage.service.js — File helper utilities
const path = require('path');
const fs   = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../uploads');

/**
 * Delete a file from the uploads directory
 */
exports.deleteFile = (filename) => {
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
};

/**
 * Return the full file path for a given filename
 */
exports.getFilePath = (filename) => path.join(UPLOAD_DIR, filename);

/**
 * Return the public URL for a file
 */
exports.getFileUrl = (filename) => `/uploads/${filename}`;
