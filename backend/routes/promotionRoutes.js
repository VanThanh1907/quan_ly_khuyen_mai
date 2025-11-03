const express = require('express');
const router = express.Router();
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  updatePromotionStatus
} = require('../controllers/promotionController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getPromotions);
router.get('/active/list', getActivePromotions);
router.get('/:id', getPromotion);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), createPromotion);
router.put('/:id', protect, authorize('admin'), updatePromotion);
router.patch('/:id/status', protect, authorize('admin'), updatePromotionStatus);
router.delete('/:id', protect, authorize('admin'), deletePromotion);

module.exports = router;
