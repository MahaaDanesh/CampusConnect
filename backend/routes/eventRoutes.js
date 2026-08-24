const express = require('express');
const { body } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getAttendees,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getEvents);
router.get('/:id', getEvent);
router.post(
  '/',
  authorize('faculty', 'admin'),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('venue').trim().notEmpty(),
    body('date').isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  createEvent
);
router.put('/:id', authorize('faculty', 'admin'), updateEvent);
router.delete('/:id', authorize('faculty', 'admin'), deleteEvent);

router.post('/:id/register', registerForEvent);
router.delete('/:id/register', cancelRegistration);
router.get('/:id/attendees', authorize('faculty', 'admin'), getAttendees);

module.exports = router;
