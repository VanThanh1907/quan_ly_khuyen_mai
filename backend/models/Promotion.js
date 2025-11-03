const mongoose = require('mongoose');

/**
 * Promotion Schema
 */
const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Promotion name is required'],
    trim: true,
    minlength: [3, 'Promotion name must be at least 3 characters long'],
    maxlength: [100, 'Promotion name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  discountPercentage: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [0, 'Discount percentage must be at least 0'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'inactive'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ⭐ VIRTUAL FIELD: Tính status động dựa trên thời gian
promotionSchema.virtual('computedStatus').get(function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  if (now < start) {
    return 'inactive'; // Chưa bắt đầu
  } else if (now >= start && now <= end) {
    return 'active'; // Đang diễn ra
  } else {
    return 'expired'; // Đã hết hạn
  }
});

// ⭐ METHOD: Tính thời gian còn lại
promotionSchema.methods.getTimeRemaining = function() {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  if (now < start) {
    // Thời gian tới khi bắt đầu
    const diff = start - now;
    return {
      status: 'starts_in',
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  } else if (now <= end) {
    // Thời gian còn lại
    const diff = end - now;
    return {
      status: 'ends_in',
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  } else {
    return {
      status: 'expired',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }
};

// ⭐ STATIC METHOD: Cập nhật status tất cả promotions
promotionSchema.statics.updateAllStatuses = async function() {
  const promotions = await this.find({});
  let updated = 0;

  for (const promo of promotions) {
    const computedStatus = promo.computedStatus;
    if (promo.status !== computedStatus) {
      promo.status = computedStatus;
      promo.updatedAt = new Date();
      await promo.save();
      updated++;
    }
  }

  return { total: promotions.length, updated };
};

// Update the updatedAt timestamp before saving
promotionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-update status based on dates
  const now = new Date();
  if (this.endDate < now) {
    this.status = 'expired';
  } else if (this.startDate <= now && this.endDate >= now && this.status === 'inactive') {
    // Don't automatically activate, let admin control this
  }
  
  next();
});

// Virtual property to check if promotion is currently valid
promotionSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Ensure virtuals are included in JSON
promotionSchema.set('toJSON', { virtuals: true });
promotionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Promotion', promotionSchema);
