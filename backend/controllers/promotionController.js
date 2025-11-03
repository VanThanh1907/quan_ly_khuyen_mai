const Promotion = require('../models/Promotion');

/**
 * @desc    Get all promotions with filters
 * @route   GET /api/promotions
 * @access  Public
 */
exports.getPromotions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute query with population
    const promotions = await Promotion.find(query)
      .populate('applicableProducts', 'name price category')
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Promotion.countDocuments(query);

    res.status(200).json({
      success: true,
      data: promotions,
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
 * @desc    Get single promotion
 * @route   GET /api/promotions/:id
 * @access  Public
 */
exports.getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('applicableProducts', 'name price category');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create new promotion
 * @route   POST /api/promotions
 * @access  Private/Admin
 */
exports.createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update promotion
 * @route   PUT /api/promotions/:id
 * @access  Private/Admin
 */
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('applicableProducts', 'name price category');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete promotion
 * @route   DELETE /api/promotions/:id
 * @access  Private/Admin
 */
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotion deleted successfully',
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
 * @desc    Get active promotions
 * @route   GET /api/promotions/active/list
 * @access  Public
 */
exports.getActivePromotions = async (req, res) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('applicableProducts', 'name price category');

    res.status(200).json({
      success: true,
      data: promotions
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update promotion status
 * @route   PATCH /api/promotions/:id/status
 * @access  Private/Admin
 */
exports.updatePromotionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promotion status updated successfully',
      data: promotion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
