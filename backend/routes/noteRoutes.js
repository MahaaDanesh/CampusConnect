const express = require('express');
const { body } = require('express-validator');
const { getNotes, getNote, createNote, updateNote, deleteNote, trackDownload } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNote);
router.post(
  '/',
  [body('title').trim().notEmpty(), body('subject').trim().notEmpty(), body('fileUrl').trim().notEmpty()],
  validate,
  createNote
);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/download', trackDownload);

module.exports = router;
