const express = require('express');
const { body } = require('express-validator');
const {
  updateMe,
  changePassword,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.put('/me', updateMe);
router.put(
  '/me/password',
  [body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')],
  validate,
  changePassword
);

router.get('/', authorize('admin'), getUsers);
router.post(
  '/',
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['student', 'faculty', 'admin']),
  ],
  validate,
  createUser
);
router.get('/:id', authorize('admin'), getUser);
router.put('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
