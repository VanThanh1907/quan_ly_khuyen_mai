const Order = require('../models/Order');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');

/**
 * 🛒 Tạo đơn hàng mới
 * Thể hiện tính chất NoSQL: Lưu SNAPSHOT của product
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // 1️⃣ Validate và lấy thông tin products
    const orderItems = [];
    let totalAmount = 0;
    let totalDiscount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Kiểm tra tồn kho
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // 2️⃣ Tìm promotion đang áp dụng cho product này
      const activePromotion = await Promotion.findOne({
        applicableProducts: product._id,
        status: 'active',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      // 3️⃣ Tính giá và discount
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
          discountAmount: discountAmount * item.quantity
        };

        totalDiscount += discountAmount * item.quantity;
      }

      const subtotal = priceAtPurchase * item.quantity;
      totalAmount += subtotal;

      // 4️⃣ 🎯 Tạo SNAPSHOT của product (NoSQL Denormalization)
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
        quantity: item.quantity,
        priceAtPurchase: priceAtPurchase,
        appliedPromotion: appliedPromotion,
        subtotal: subtotal
      });

      // 5️⃣ Giảm số lượng tồn kho
      product.stock -= item.quantity;
      await product.save();
    }

    // 6️⃣ Tạo order number
    const orderNumber = await Order.generateOrderNumber();

    // 7️⃣ Tạo đơn hàng
    const order = await Order.create({
      orderNumber,
      user: {
        userId: req.user.id,
        username: req.user.username
      },
      items: orderItems,
      totalAmount: totalAmount + totalDiscount, // Tổng trước giảm giá
      totalDiscount,
      finalAmount: totalAmount, // Tổng sau giảm giá
      shippingAddress,
      paymentMethod,
      notes
    });

    res.status(201).json({
      success: true,
      message: '✅ Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

/**
 * 📋 Lấy danh sách đơn hàng của user
 */
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { 'user.userId': req.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * 📄 Lấy chi tiết đơn hàng
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // 🎯 Kiểm tra products có còn tồn tại không (thể hiện NoSQL)
    const productExistence = await order.checkProductsExistence();

    res.status(200).json({
      success: true,
      data: order,
      productExistence // Thông tin về các product đã bị xóa
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

/**
 * 📋 Admin: Lấy tất cả đơn hàng
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    // 📊 Thống kê
    const stats = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalOrders: { $sum: 1 },
          totalDiscount: { $sum: '$totalDiscount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
      stats: stats[0] || { totalRevenue: 0, totalOrders: 0, totalDiscount: 0 }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

/**
 * ✏️ Cập nhật trạng thái đơn hàng
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Kiểm tra quyền (chỉ admin hoặc chủ đơn hàng mới được hủy)
    if (status === 'cancelled') {
      if (order.user.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Hoàn lại stock nếu hủy đơn
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          );
        }
      }
    }

    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

/**
 * 🗑️ Xóa đơn hàng (chỉ admin)
 */
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: error.message
    });
  }
};

/**
 * 📊 Thống kê đơn hàng theo user
 */
exports.getUserOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { 'user.userId': req.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' }
        }
      }
    ]);

    const totalSpent = await Order.aggregate([
      { 
        $match: { 
          'user.userId': req.user.id,
          status: { $in: ['delivered', 'processing', 'shipped'] }
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalAmount' },
          orders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        totalSpent: totalSpent[0] || { total: 0, orders: 0 }
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
