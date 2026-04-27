// routes/task.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/task.controller');
const auth   = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const upload = require('../middleware/upload.middleware');

router.use(auth);

router.get('/',              ctrl.getTasks);
router.get('/:id',           ctrl.getTaskById);
router.post('/',             allowRoles('admin','project_manager','team_leader'), ctrl.createTask);
router.put('/:id',           ctrl.updateTask);
router.put('/:id/approve',   allowRoles('admin','project_manager','team_leader'), ctrl.approveTask);
router.put('/:id/reject',    allowRoles('admin','project_manager','team_leader'), upload.single('screenshot'), ctrl.rejectTask);
router.delete('/:id',        allowRoles('admin','project_manager','team_leader'), ctrl.deleteTask);

module.exports = router;
