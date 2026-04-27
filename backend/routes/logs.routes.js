const router = require('express').Router();
const ctrl = require('../controllers/logs.controller');
const auth = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.get('/', auth, allowRoles('admin'), ctrl.getLogs);

module.exports = router;
