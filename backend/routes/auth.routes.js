// routes/auth.routes.js
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl    = require('../controllers/auth.controller');
const auth    = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');

// Ensure avatars directory exists
const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  validate,
  ctrl.requestPasswordReset
);

router.post('/register',
  auth, allowRoles('admin'),
  upload.single('avatar'),
  [
    body('name').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['admin','project_manager','team_leader','team_member']).withMessage('Invalid role selected'),
  ],
  validate,
  ctrl.register
);

router.get('/me', auth, ctrl.getMe);

module.exports = router;
