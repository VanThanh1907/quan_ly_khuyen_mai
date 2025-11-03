const mongoose = require('mongoose');

/**
 * Order Schema
 * 🎯 Thể hiện tính chất NoSQL: Data Denormalization
 * - Lưu SNAPSHOT của product trực tiếp vào order
 * - Khi product bị xóa, order vẫn giữ nguyên thông tin
 * - Trade-off: Dữ liệu có thể không đồng bộ nhưng đảm bảo tính toàn vẹn lịch sử
 */
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
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
    // 🎯 SNAPSHOT của Product (Denormalized Data)
    // Lưu toàn bộ thông tin product tại thời điểm mua
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
      // Không required - vì product có thể bị xóa sau này
    },
    productSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      category: { type: String, required: true },
      description: String,
      imageUrl: String,
      brand: String,
      specifications: mongoose.Schema.Types.Mixed
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    priceAtPurchase: {
      type: Number,
      required: true
    },
    // 🎯 Thông tin khuyến mãi (nếu có)
    appliedPromotion: {
      promotionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion'
      },
      name: String,
      discountPercentage: Number,
      discountAmount: Number
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: String,
    ward: String,
    zipCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer', 'e_wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: Date
});

// 📊 Index để tìm kiếm nhanh
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'user.userId': 1, createdAt: -1 });
orderSchema.index({ status: 1 });

// ⏰ Auto-update timestamps
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 🔢 Static method: Tạo order number tự động
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Format: ORD-YYYYMMDD-XXXX
  const prefix = `ORD-${year}${month}${day}`;
  
  // Tìm order cuối cùng trong ngày
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
};

// 📈 Instance method: Tính tổng số lượng sản phẩm
orderSchema.methods.getTotalItems = function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// ✅ Instance method: Kiểm tra xem product có còn tồn tại không
orderSchema.methods.checkProductsExistence = async function() {
  const Product = mongoose.model('Product');
  const results = [];
  
  for (const item of this.items) {
    if (item.productId) {
      const exists = await Product.exists({ _id: item.productId });
      results.push({
        productId: item.productId,
        productName: item.productSnapshot.name,
        exists: !!exists,
        message: exists ? 'Product still exists' : '⚠️ Product has been deleted'
      });
    } else {
      results.push({
        productName: item.productSnapshot.name,
        exists: false,
        message: '⚠️ Product was deleted before order was created'
      });
    }
  }
  
  return results;
};

// 🎯 Virtual: Format giá tiền
orderSchema.virtual('formattedFinalAmount').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(this.finalAmount);
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
