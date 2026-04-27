// routes/team.routes.js
const router = require('express').Router();
const ctrl   = require('../controllers/team.controller');
const auth   = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

router.use(auth);

router.get('/',    ctrl.getTeams);
router.get('/:id', ctrl.getTeamById);
router.post('/',   allowRoles('admin','project_manager'), ctrl.createTeam);
router.put('/:id', allowRoles('admin','project_manager'), ctrl.updateTeam);
router.delete('/:id', allowRoles('admin','project_manager'), ctrl.deleteTeam);
router.post('/:id/members',           allowRoles('admin','project_manager'), ctrl.addMember);
router.delete('/:id/members/:userId', allowRoles('admin','project_manager'), ctrl.removeMember);

module.exports = router;
