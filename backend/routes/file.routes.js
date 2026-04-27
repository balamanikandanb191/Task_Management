// routes/file.routes.js
const router  = require('express').Router();
const multer  = require('multer');
const ctrl    = require('../controllers/file.controller');
const auth    = require('../middleware/auth.middleware');
const upload  = require('../middleware/upload.middleware');

router.use(auth);

// Wrapper to catch multer errors gracefully (prevents ERR_CONNECTION_RESET)
const handleUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      const logger = require('../utils/logger');
      const fs = require('fs');
      const path = require('path');
      const logPath = path.join(__dirname, '..', 'login_debug.log');
      
      const errorMsg = err instanceof multer.MulterError 
        ? `MulterError: ${err.code} - ${err.message}` 
        : `UploadError: ${err.message}`;
      
      logger.error(`[Upload Fail] ${errorMsg}`);
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] UPLOAD ERROR 400: ${errorMsg}\n`);

      return res.status(400).json({ 
        success: false, 
        message: err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large. Max limit is 50MB.'
          : errorMsg 
      });
    }
    next();
  });
};

router.post('/upload/project/:projectId', handleUpload('file'), ctrl.uploadProjectFile);
router.post('/upload/:taskId',            handleUpload('file'), ctrl.uploadFile);
router.get('/task/:taskId',    ctrl.getTaskFiles);
router.get('/project/:projectId', ctrl.getProjectFiles);
router.delete('/:id/:type',    ctrl.deleteFile);

module.exports = router;
