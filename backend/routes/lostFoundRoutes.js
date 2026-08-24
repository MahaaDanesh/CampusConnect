const express = require('express');
const { body } = require('express-validator');
const {
  getLostFoundItems,
  getLostFoundItem,
  createLostFoundItem,
  updateLostFoundItem,
  deleteLostFoundItem,
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

router.get('/', getLostFoundItems);
router.get('/:id', getLostFoundItem);
router.post(
  '/',
  [
    body('type').isIn(['lost', 'found']),
    body('itemName').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('date').isISO8601(),
  ],
  validate,
  createLostFoundItem
);
router.put('/:id', updateLostFoundItem);
router.delete('/:id', deleteLostFoundItem);

module.exports = router;
