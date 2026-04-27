// routes/user.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/user.controller');
const auth   = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.use(auth);

router.get('/stats', allowRoles('admin'), ctrl.getStats);
router.get('/',      ctrl.getUsers);
// Reset Requests
router.get('/reset-requests', allowRoles('admin'), ctrl.getResetRequests);
router.put('/reset-requests/:id', allowRoles('admin'), ctrl.updateResetRequestStatus);

router.get('/:id',   ctrl.getUserById);
router.put('/:id',   allowRoles('admin'), ctrl.updateUser);
router.delete('/:id',allowRoles('admin'), ctrl.deleteUser);
router.put('/:id/password', allowRoles('admin'), ctrl.resetPassword);

module.exports = router;
