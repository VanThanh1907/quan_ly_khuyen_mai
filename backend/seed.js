const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Promotion = require('./models/Promotion');

// Sample data
const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user'
  }
];

const products = [
  {
    name: 'Laptop Dell XPS 15',
    price: 1299.99,
    category: 'Electronics',
    description: 'High-performance laptop for professionals',
    stock: 50
  },
  {
    name: 'iPhone 15 Pro',
    price: 999.99,
    category: 'Electronics',
    description: 'Latest iPhone with advanced features',
    stock: 100
  },
  {
    name: 'Samsung 4K TV 55"',
    price: 699.99,
    category: 'Electronics',
    description: 'Smart TV with stunning picture quality',
    stock: 30
  },
  {
    name: 'Nike Air Max Shoes',
    price: 129.99,
    category: 'Fashion',
    description: 'Comfortable running shoes',
    stock: 200
  },
  {
    name: 'Adidas T-Shirt',
    price: 29.99,
    category: 'Fashion',
    description: 'Cotton sports t-shirt',
    stock: 300
  },
  {
    name: 'Coffee Maker Deluxe',
    price: 89.99,
    category: 'Home & Kitchen',
    description: 'Programmable coffee maker with timer',
    stock: 75
  },
  {
    name: 'Blender Pro 3000',
    price: 59.99,
    category: 'Home & Kitchen',
    description: 'High-speed blender for smoothies',
    stock: 60
  },
  {
    name: 'Gaming Mouse RGB',
    price: 49.99,
    category: 'Electronics',
    description: 'Ergonomic gaming mouse with RGB lighting',
    stock: 150
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Promotion.deleteMany();
    console.log('Existing data cleared...');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);

    // Create sample promotions
    const promotions = [
      {
        name: 'Black Friday Electronics Sale',
        description: 'Massive discounts on all electronics items',
        discountPercentage: 25,
        startDate: new Date('2025-11-01'),
        endDate: new Date('2025-11-30'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Electronics')
          .map(p => p._id),
        status: 'active'
      },
      {
        name: 'Summer Fashion Clearance',
        description: 'Clear out summer inventory with amazing deals',
        discountPercentage: 40,
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-31'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Fashion')
          .map(p => p._id),
        status: 'inactive'
      },
      {
        name: 'Kitchen Essentials Promo',
        description: 'Upgrade your kitchen with discounted appliances',
        discountPercentage: 15,
        startDate: new Date('2025-10-15'),
        endDate: new Date('2025-12-31'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Home & Kitchen')
          .map(p => p._id),
        status: 'active'
      },
      {
        name: 'New Year Sale',
        description: 'Start the new year with great deals',
        discountPercentage: 30,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-15'),
        applicableProducts: createdProducts.map(p => p._id),
        status: 'inactive'
      },
      {
        name: 'Weekend Flash Sale',
        description: 'Limited time offer - this weekend only!',
        discountPercentage: 50,
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-03'),
        applicableProducts: [createdProducts[0]._id, createdProducts[1]._id],
        status: 'expired'
      }
    ];

    const createdPromotions = await Promotion.create(promotions);
    console.log(`${createdPromotions.length} promotions created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('User  - Username: user, Password: user123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
