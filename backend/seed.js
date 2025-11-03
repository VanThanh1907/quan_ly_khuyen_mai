const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Product = require('./models/Product');
const Promotion = require('./models/Promotion');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

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
    stock: 50,
    imageUrl: '/images/products/laptop-dell.jpg',
    brand: 'Dell',
    specifications: { processor: 'Intel i7', ram: '16GB', storage: '512GB SSD' },
    ratings: 4.5
  },
  {
    name: 'iPhone 15 Pro',
    price: 999.99,
    category: 'Electronics',
    description: 'Latest iPhone with advanced features',
    stock: 100,
    imageUrl: '/images/products/iphone-15-pro.jpg',
    brand: 'Apple',
    specifications: { screen: '6.1 inch', storage: '256GB', camera: '48MP' },
    ratings: 4.8
  },
  {
    name: 'Samsung 4K TV 55"',
    price: 699.99,
    category: 'Electronics',
    description: 'Smart TV with stunning picture quality',
    stock: 30,
    imageUrl: '/images/products/samsung-tv.jpg',
    brand: 'Samsung',
    specifications: { screen: '55 inch', resolution: '4K UHD', smart: 'Yes' },
    ratings: 4.6
  },
  {
    name: 'Nike Air Max Shoes',
    price: 129.99,
    category: 'Fashion',
    description: 'Comfortable running shoes',
    stock: 200,
    imageUrl: '/images/products/nike-shoes.jpg',
    brand: 'Nike',
    specifications: { size: '8-12', color: 'Multiple', material: 'Mesh' },
    ratings: 4.4
  },
  {
    name: 'Adidas T-Shirt',
    price: 29.99,
    category: 'Fashion',
    description: 'Cotton sports t-shirt',
    stock: 300,
    imageUrl: '/images/products/adidas-tshirt.jpg',
    brand: 'Adidas',
    specifications: { size: 'S-XXL', material: '100% Cotton', fit: 'Regular' },
    ratings: 4.2
  },
  {
    name: 'Coffee Maker Deluxe',
    price: 89.99,
    category: 'Home & Kitchen',
    description: 'Programmable coffee maker with timer',
    stock: 75,
    imageUrl: '/images/products/coffee-maker.jpg',
    brand: 'Cuisinart',
    specifications: { capacity: '12 cups', programmable: 'Yes', timer: 'Yes' },
    ratings: 4.3
  },
  {
    name: 'Blender Pro 3000',
    price: 59.99,
    category: 'Home & Kitchen',
    description: 'High-speed blender for smoothies',
    stock: 60,
    imageUrl: '/images/products/blender.jpg',
    brand: 'NutriBullet',
    specifications: { power: '1000W', capacity: '64oz', speeds: '3' },
    ratings: 4.5
  },
  {
    name: 'Gaming Mouse RGB',
    price: 49.99,
    category: 'Electronics',
    description: 'Ergonomic gaming mouse with RGB lighting',
    stock: 150,
    imageUrl: '/images/products/gaming-mouse.jpg',
    brand: 'Logitech',
    specifications: { dpi: '16000', buttons: '7', wireless: 'No' },
    ratings: 4.7
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
    await Order.deleteMany();
    await Cart.deleteMany();
    console.log('Existing data cleared...');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Create products
    const createdProducts = await Product.create(products);
    console.log(`${createdProducts.length} products created`);

    // Create sample promotions with specific times
    const promotions = [
      {
        name: 'Black Friday Electronics Sale',
        description: 'Massive discounts on all electronics items',
        discountPercentage: 25,
        startDate: new Date('2025-11-01T00:00:00'),
        endDate: new Date('2025-11-30T23:59:59'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Electronics')
          .map(p => p._id),
        status: 'active'
      },
      {
        name: 'Summer Fashion Clearance',
        description: 'Clear out summer inventory with amazing deals',
        discountPercentage: 40,
        startDate: new Date('2025-08-01T08:00:00'),
        endDate: new Date('2025-08-31T20:00:00'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Fashion')
          .map(p => p._id),
        status: 'inactive'
      },
      {
        name: 'Kitchen Essentials Promo',
        description: 'Upgrade your kitchen with discounted appliances',
        discountPercentage: 15,
        startDate: new Date('2025-10-15T10:30:00'),
        endDate: new Date('2025-12-31T18:45:30'),
        applicableProducts: createdProducts
          .filter(p => p.category === 'Home & Kitchen')
          .map(p => p._id),
        status: 'active'
      },
      {
        name: 'New Year Sale',
        description: 'Start the new year with great deals',
        discountPercentage: 30,
        startDate: new Date('2026-01-01T00:00:00'),
        endDate: new Date('2026-01-15T23:59:59'),
        applicableProducts: createdProducts.map(p => p._id),
        status: 'inactive'
      },
      {
        name: 'Weekend Flash Sale',
        description: 'Limited time offer - this weekend only!',
        discountPercentage: 50,
        startDate: new Date('2024-12-01T06:00:00'),
        endDate: new Date('2024-12-03T23:59:59'),
        applicableProducts: [createdProducts[0]._id, createdProducts[1]._id],
        status: 'expired'
      }
    ];

    const createdPromotions = await Promotion.create(promotions);
    console.log(`${createdPromotions.length} promotions created`);

    // Create sample orders (🎯 NoSQL Feature: Denormalized Data)
    const sampleOrders = [
      {
        orderNumber: 'ORD-20251101-0001',
        user: {
          userId: createdUsers[1]._id, // user account
          username: createdUsers[1].username
        },
        items: [
          {
            productId: createdProducts[0]._id, // Laptop Dell
            productSnapshot: {
              name: createdProducts[0].name,
              price: createdProducts[0].price,
              category: createdProducts[0].category,
              description: createdProducts[0].description,
              imageUrl: createdProducts[0].imageUrl,
              brand: createdProducts[0].brand,
              specifications: createdProducts[0].specifications
            },
            quantity: 1,
            priceAtPurchase: 974.99, // With 25% discount
            appliedPromotion: {
              promotionId: createdPromotions[0]._id,
              name: createdPromotions[0].name,
              discountPercentage: 25,
              discountAmount: 325
            },
            subtotal: 974.99
          },
          {
            productId: createdProducts[7]._id, // Gaming Mouse
            productSnapshot: {
              name: createdProducts[7].name,
              price: createdProducts[7].price,
              category: createdProducts[7].category,
              description: createdProducts[7].description,
              imageUrl: createdProducts[7].imageUrl,
              brand: createdProducts[7].brand,
              specifications: createdProducts[7].specifications
            },
            quantity: 2,
            priceAtPurchase: 37.49, // With 25% discount
            appliedPromotion: {
              promotionId: createdPromotions[0]._id,
              name: createdPromotions[0].name,
              discountPercentage: 25,
              discountAmount: 12.5
            },
            subtotal: 74.98
          }
        ],
        totalAmount: 1374.97,
        totalDiscount: 350,
        finalAmount: 1049.97,
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          fullName: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC',
          city: 'TP.HCM',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé'
        },
        paymentMethod: 'credit_card',
        createdAt: new Date('2025-11-02T10:30:00'),
        deliveredAt: new Date('2025-11-05T14:20:00')
      },
      {
        orderNumber: 'ORD-20251103-0001',
        user: {
          userId: createdUsers[1]._id,
          username: createdUsers[1].username
        },
        items: [
          {
            productId: createdProducts[3]._id, // Nike Shoes
            productSnapshot: {
              name: createdProducts[3].name,
              price: createdProducts[3].price,
              category: createdProducts[3].category,
              description: createdProducts[3].description,
              imageUrl: createdProducts[3].imageUrl,
              brand: createdProducts[3].brand,
              specifications: createdProducts[3].specifications
            },
            quantity: 1,
            priceAtPurchase: 129.99, // No discount
            appliedPromotion: null,
            subtotal: 129.99
          }
        ],
        totalAmount: 129.99,
        totalDiscount: 0,
        finalAmount: 129.99,
        status: 'processing',
        paymentStatus: 'paid',
        shippingAddress: {
          fullName: 'Nguyễn Văn A',
          phone: '0123456789',
          address: '123 Đường ABC',
          city: 'TP.HCM',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé'
        },
        paymentMethod: 'e_wallet',
        createdAt: new Date('2025-11-03T15:45:00')
      }
    ];

    const createdOrders = await Order.create(sampleOrders);
    console.log(`${createdOrders.length} orders created`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('User  - Username: user, Password: user123');
    console.log('\n🎯 NoSQL Feature: Orders contain product snapshots (denormalized data)');
    console.log('   When you delete a product, the order will still have the product info!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
