const express = require('express');
const { getOverview } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/overview', getOverview);

module.exports = router;
