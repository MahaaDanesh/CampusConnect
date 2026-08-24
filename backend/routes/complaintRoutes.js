const express = require('express');
const { body } = require('express-validator');
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaintStatus,
  addComment,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getComplaints);
router.get('/:id', getComplaint);
router.post(
  '/',
  [body('title').trim().notEmpty(), body('description').trim().notEmpty()],
  validate,
  createComplaint
);
router.put('/:id/status', authorize('faculty', 'admin'), updateComplaintStatus);
router.post('/:id/comments', [body('text').trim().notEmpty()], validate, addComment);
router.delete('/:id', deleteComplaint);

module.exports = router;
