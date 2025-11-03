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
