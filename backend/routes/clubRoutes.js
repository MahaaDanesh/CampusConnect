const express = require('express');
const { body } = require('express-validator');
const {
  getClubs,
  getClub,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub,
} = require('../controllers/clubController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getClubs);
router.get('/:id', getClub);
router.post(
  '/',
  authorize('faculty', 'admin'),
  [body('name').trim().notEmpty(), body('description').trim().notEmpty()],
  validate,
  createClub
);
router.put('/:id', authorize('faculty', 'admin'), updateClub);
router.delete('/:id', authorize('admin'), deleteClub);
router.post('/:id/join', joinClub);
router.delete('/:id/leave', leaveClub);

module.exports = router;
