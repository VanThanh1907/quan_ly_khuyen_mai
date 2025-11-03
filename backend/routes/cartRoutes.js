const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

/**
 * 🛒 Cart Routes
 * All routes require authentication
 */

// 📋 Get cart
router.get('/', authenticate, cartController.getCart);

// ➕ Add item to cart
router.post('/add', authenticate, cartController.addToCart);

// ✏️ Update cart item quantity
router.put('/update', authenticate, cartController.updateCartItem);

// 🗑️ Remove item from cart
router.delete('/remove/:productId', authenticate, cartController.removeFromCart);

// 🗑️ Clear cart
router.delete('/clear', authenticate, cartController.clearCart);

// ✅ Validate cart (check stock availability)
router.get('/validate', authenticate, cartController.validateCart);

// 💳 Checkout (create order from cart)
router.post('/checkout', authenticate, cartController.checkout);

module.exports = router;
