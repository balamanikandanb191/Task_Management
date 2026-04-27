// routes/comment.routes.js
const router = require('express').Router();
const ctrl             = require('../controllers/comment.controller');
const projectCommentCtrl = require('../controllers/projectComment.controller');
const auth   = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');

router.use(auth);
router.get('/task/:taskId',    ctrl.getComments);
router.post('/task/:taskId',   [body('comment').notEmpty()], validate, ctrl.addComment);

router.get('/project/:projectId',  projectCommentCtrl.getProjectComments);
router.post('/project/:projectId', [body('comment').notEmpty()], validate, projectCommentCtrl.addProjectComment);

router.delete('/:id',          ctrl.deleteComment);

module.exports = router;
