// routes/notification.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/notification.controller');
const auth   = require('../middleware/auth.middleware');

router.use(auth);
router.get('/',               ctrl.getNotifications);
router.put('/read-all',       ctrl.markAllRead);
router.put('/:id/read',       ctrl.markRead);

module.exports = router;
