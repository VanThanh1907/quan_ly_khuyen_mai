const Product = require('../models/Product');
const Promotion = require('../models/Promotion');

/**
 * ⭐ Tính giá sau giảm cho một product
 */
const calculateDiscountedPrice = async (product) => {
  // Tìm promotions active áp dụng cho product này
  const activePromotions = await Promotion.find({
    applicableProducts: product._id,
    status: 'active',
    $expr: {
      $and: [
        { $lte: ['$startDate', new Date()] },
        { $gte: ['$endDate', new Date()] }
      ]
    }
  }).sort({ discountPercentage: -1 }); // Lấy discount cao nhất

  if (activePromotions.length > 0) {
    const bestPromo = activePromotions[0];
    const discountAmount = (product.price * bestPromo.discountPercentage) / 100;
    const discountedPrice = product.price - discountAmount;
    
    return {
      originalPrice: product.price,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      discountPercentage: bestPromo.discountPercentage,
      saveAmount: Math.round(discountAmount * 100) / 100,
      promotion: {
        id: bestPromo._id,
        name: bestPromo.name,
        description: bestPromo.description,
        endDate: bestPromo.endDate
      }
    };
  }

  return {
    originalPrice: product.price,
    discountedPrice: product.price,
    discountPercentage: 0,
    saveAmount: 0,
    promotion: null
  };
};

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute query
    const products = await Product.find(query)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    // ⭐ Tính giá sau giảm cho mỗi product
    const productsWithPricing = await Promise.all(
      products.map(async (product) => {
        const pricing = await calculateDiscountedPrice(product);
        return {
          ...product.toObject(),
          pricing
        };
      })
    );

    res.status(200).json({
      success: true,
      data: productsWithPricing,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ⭐ Tính giá sau giảm
    const pricing = await calculateDiscountedPrice(product);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        pricing
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all product categories
 * @route   GET /api/products/categories/list
 * @access  Public
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
