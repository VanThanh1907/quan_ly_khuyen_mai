const mongoose = require('mongoose');

/**
 * Cart Schema
 * 🎯 NoSQL Features:
 * - Embedded product snapshot for quick display
 * - Real-time stock validation before checkout
 * - User-specific cart with TTL (auto-expire after 30 days)
 */
const cartSchema = new mongoose.Schema({
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    // 🎯 Product snapshot for quick display (but always validate stock before checkout)
    productSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: String,
      category: String,
      brand: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Auto-expire cart after 30 days of inactivity
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    expires: 0 // TTL index
  }
});

// 📊 Index for quick lookup
cartSchema.index({ 'user.userId': 1 });
cartSchema.index({ 'items.productId': 1 });

// ⏰ Auto-update timestamps
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Reset expiry on update
  next();
});

// 📈 Calculate total items count
cartSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// 💰 Calculate total price (with current prices, not snapshot)
cartSchema.methods.calculateTotal = async function() {
  const Product = mongoose.model('Product');
  let total = 0;
  
  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  
  return total;
};

// ✅ Validate stock availability for all items
cartSchema.methods.validateStock = async function() {
  const Product = mongoose.model('Product');
  const results = [];
  let allAvailable = true;
  
  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      results.push({
        productId: item.productId,
        productName: item.productSnapshot.name,
        requestedQuantity: item.quantity,
        available: false,
        reason: 'Product not found or has been deleted',
        availableStock: 0
      });
      allAvailable = false;
    } else if (product.stock < item.quantity) {
      results.push({
        productId: item.productId,
        productName: product.name,
        requestedQuantity: item.quantity,
        available: false,
        reason: 'Insufficient stock',
        availableStock: product.stock
      });
      allAvailable = false;
    } else {
      results.push({
        productId: item.productId,
        productName: product.name,
        requestedQuantity: item.quantity,
        available: true,
        availableStock: product.stock
      });
    }
  }
  
  return {
    allAvailable,
    items: results
  };
};

// 🎯 Get cart with current product prices and promotions
cartSchema.methods.getCartWithCurrentData = async function() {
  const Product = mongoose.model('Product');
  const Promotion = mongoose.model('Promotion');
  
  const enrichedItems = [];
  let subtotal = 0;
  let totalDiscount = 0;
  
  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      enrichedItems.push({
        ...item.toObject(),
        currentPrice: item.productSnapshot.price,
        available: false,
        stock: 0,
        promotion: null
      });
      continue;
    }
    
    // Check for active promotion
    const promotion = await Promotion.findOne({
      applicableProducts: product._id,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    let currentPrice = product.price;
    let discountAmount = 0;
    
    if (promotion) {
      discountAmount = (currentPrice * promotion.discountPercentage) / 100;
      currentPrice = currentPrice - discountAmount;
    }
    
    const itemSubtotal = currentPrice * item.quantity;
    const itemDiscount = discountAmount * item.quantity;
    
    subtotal += itemSubtotal;
    totalDiscount += itemDiscount;
    
    enrichedItems.push({
      ...item.toObject(),
      currentPrice: product.price,
      discountedPrice: currentPrice,
      available: product.stock >= item.quantity,
      stock: product.stock,
      promotion: promotion ? {
        id: promotion._id,
        name: promotion.name,
        discountPercentage: promotion.discountPercentage,
        discountAmount: discountAmount
      } : null,
      itemSubtotal,
      itemDiscount
    });
  }
  
  return {
    ...this.toObject(),
    items: enrichedItems,
    subtotal: subtotal + totalDiscount,
    totalDiscount,
    total: subtotal
  };
};

// 🗑️ Remove unavailable products from cart
cartSchema.methods.removeUnavailableProducts = async function() {
  const Product = mongoose.model('Product');
  const availableItems = [];
  
  for (const item of this.items) {
    const product = await Product.findById(item.productId);
    if (product && product.stock > 0) {
      availableItems.push(item);
    }
  }
  
  this.items = availableItems;
  await this.save();
  
  return this;
};

module.exports = mongoose.model('Cart', cartSchema);
