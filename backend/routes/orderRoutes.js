const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * 🛒 Order Routes
 * Note: Specific routes must come before generic routes with params
 */

// 📋 Lấy danh sách đơn hàng của user (must be before /:id)
router.get('/my-orders', authenticate, orderController.getUserOrders);

// 📊 Thống kê đơn hàng của user (must be before /:id)
router.get('/my-stats', authenticate, orderController.getUserOrderStats);

// � Admin: Lấy tất cả đơn hàng (must be before /:id)
router.get('/admin/all', authenticate, authorize('admin'), orderController.getAllOrders);

// 📝 Tạo đơn hàng mới (user đã đăng nhập)
router.post('/', authenticate, orderController.createOrder);

// � Lấy chi tiết đơn hàng
router.get('/:id', authenticate, orderController.getOrderById);

// ✏️ Cập nhật trạng thái đơn hàng
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);

// 🗑️ Xóa đơn hàng (admin only)
router.delete('/:id', authenticate, authorize('admin'), orderController.deleteOrder);

module.exports = router;
