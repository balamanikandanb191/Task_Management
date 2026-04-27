// routes/project.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/project.controller');
const auth   = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const upload = require('../middleware/upload.middleware');

router.use(auth);

router.get('/',     ctrl.getProjects);
router.get('/:id',  ctrl.getProjectById);
router.post('/',    allowRoles('admin','project_manager'), upload.single('workflow'), ctrl.createProject);
router.put('/:id',  allowRoles('admin','project_manager'), ctrl.updateProject);
router.delete('/:id', allowRoles('admin', 'project_manager'), ctrl.deleteProject);

module.exports = router;
