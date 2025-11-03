const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * 🛒 Get user's cart
 */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: {
          userId: req.user.id,
          username: req.user.username
        },
        items: []
      });
    }
    
    // Get cart with current prices and promotions
    const enrichedCart = await cart.getCartWithCurrentData();
    
    res.status(200).json({
      success: true,
      data: enrichedCart
    });
    
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

/**
 * ➕ Add item to cart
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Validate product exists and has stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available`
      });
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart) {
      cart = new Cart({
        user: {
          userId: req.user.id,
          username: req.user.username
        },
        items: []
      });
    }
    
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add ${quantity} more. Only ${product.stock - cart.items[existingItemIndex].quantity} items available`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          brand: product.brand
        },
        quantity
      });
    }
    
    await cart.save();
    
    // Return enriched cart
    const enrichedCart = await cart.getCartWithCurrentData();
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: enrichedCart
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: error.message
    });
  }
};

/**
 * ✏️ Update cart item quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Validate stock
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available`
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    
    const enrichedCart = await cart.getCartWithCurrentData();
    
    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: enrichedCart
    });
    
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

/**
 * 🗑️ Remove item from cart
 */
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    
    await cart.save();
    
    const enrichedCart = await cart.getCartWithCurrentData();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: enrichedCart
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

/**
 * 🗑️ Clear cart
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};

/**
 * ✅ Validate cart before checkout
 */
exports.validateCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    const validation = await cart.validateStock();
    
    if (!validation.allAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Some items are not available',
        validation
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'All items are available',
      validation
    });
    
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart',
      error: error.message
    });
  }
};

/**
 * 💳 Checkout - Create order from cart
 */
exports.checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    
    // Get cart
    const cart = await Cart.findOne({ 'user.userId': req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate stock
    const validation = await cart.validateStock();
    
    if (!validation.allAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Some items are not available. Please review your cart.',
        unavailableItems: validation.items.filter(item => !item.available)
      });
    }
    
    // Prepare order items (same logic as createOrder in orderController)
    const orderItems = [];
    let totalAmount = 0;
    let totalDiscount = 0;
    
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      
      if (!product) {
        continue; // Skip if product deleted
      }
      
      // Find active promotion
      const Promotion = require('../models/Promotion');
      const activePromotion = await Promotion.findOne({
        applicableProducts: product._id,
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });
      
      let priceAtPurchase = product.price;
      let discountAmount = 0;
      let appliedPromotion = null;
      
      if (activePromotion) {
        discountAmount = (priceAtPurchase * activePromotion.discountPercentage) / 100;
        priceAtPurchase = priceAtPurchase - discountAmount;
        
        appliedPromotion = {
          promotionId: activePromotion._id,
          name: activePromotion.name,
          discountPercentage: activePromotion.discountPercentage,
          discountAmount: discountAmount * cartItem.quantity
        };
        
        totalDiscount += discountAmount * cartItem.quantity;
      }
      
      const subtotal = priceAtPurchase * cartItem.quantity;
      totalAmount += subtotal;
      
      orderItems.push({
        productId: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          brand: product.brand,
          specifications: product.specifications
        },
        quantity: cartItem.quantity,
        priceAtPurchase: priceAtPurchase,
        appliedPromotion: appliedPromotion,
        subtotal: subtotal
      });
      
      // Decrease stock
      product.stock -= cartItem.quantity;
      await product.save();
    }
    
    // Generate order number
    const orderNumber = await Order.generateOrderNumber();
    
    // Create order
    const order = await Order.create({
      orderNumber,
      user: {
        userId: req.user.id,
        username: req.user.username
      },
      items: orderItems,
      totalAmount: totalAmount + totalDiscount,
      totalDiscount,
      finalAmount: totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });
    
    // Clear cart after successful order
    cart.items = [];
    await cart.save();
    
    res.status(201).json({
      success: true,
      message: '✅ Order created successfully from cart',
      data: order
    });
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete checkout',
      error: error.message
    });
  }
};
