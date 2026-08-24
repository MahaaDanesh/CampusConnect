const express = require('express');
const { body } = require('express-validator');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncement);
router.post(
  '/',
  authorize('faculty', 'admin'),
  [body('title').trim().notEmpty(), body('content').trim().notEmpty()],
  validate,
  createAnnouncement
);
router.put('/:id', authorize('faculty', 'admin'), updateAnnouncement);
router.delete('/:id', authorize('faculty', 'admin'), deleteAnnouncement);

module.exports = router;
