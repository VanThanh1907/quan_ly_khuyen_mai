const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const Promotion = require('./models/Promotion'); // Add this!
require('dotenv').config();

async function testCartAndOrder() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/promotion_management');
    console.log('✅ Connected to MongoDB\n');

    // 1. Check existing data
    console.log('📊 Current Database Statistics:');
    console.log('- Carts:', await Cart.countDocuments());
    console.log('- Orders:', await Order.countDocuments());
    console.log('- Products:', await Product.countDocuments());
    console.log('- Users:', await User.countDocuments());

    // 2. Get test user and product
    console.log('\n📋 Getting Test Data...');
    const user = await User.findOne({ username: 'user' });
    const product = await Product.findOne();

    if (!user) {
      console.log('❌ User "user" not found. Please run: npm run seed');
      return;
    }
    if (!product) {
      console.log('❌ No products found. Please run: npm run seed');
      return;
    }

    console.log('✅ Test User:', user.username, '(ID:', user._id, ')');
    console.log('✅ Test Product:', product.name);
    console.log('   - Price:', product.price);
    console.log('   - Stock:', product.stock);
    console.log('   - ID:', product._id);

    // 3. Test Create Cart
    console.log('\n🧪 TEST 1: Creating Cart...');
    
    // Delete existing cart for this user
    await Cart.deleteMany({ 'user.userId': user._id });
    console.log('- Cleaned old carts');

    const newCart = new Cart({
      user: {
        userId: user._id,
        username: user.username
      },
      items: [{
        productId: product._id,
        productSnapshot: {
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          category: product.category,
          brand: product.brand
        },
        quantity: 2
      }]
    });

    await newCart.save();
    console.log('✅ Cart created with ID:', newCart._id);
    console.log('   - User:', newCart.user.username);
    console.log('   - Items:', newCart.items.length);
    console.log('   - First item:', newCart.items[0].productSnapshot.name);
    console.log('   - Quantity:', newCart.items[0].quantity);

    // 4. Verify cart in database
    console.log('\n🔍 TEST 2: Verifying Cart in Database...');
    const savedCart = await Cart.findById(newCart._id);
    if (savedCart) {
      console.log('✅ Cart found in database!');
      console.log('   - ID:', savedCart._id);
      console.log('   - Created at:', savedCart.createdAt);
      console.log('   - Expires at:', savedCart.expiresAt);
    } else {
      console.log('❌ Cart NOT found in database!');
    }

    // 5. Test enriched cart data
    console.log('\n🔍 TEST 3: Testing getCartWithCurrentData...');
    const enrichedCart = await savedCart.getCartWithCurrentData();
    console.log('✅ Enriched cart data:');
    console.log('   - Subtotal:', enrichedCart.subtotal);
    console.log('   - Discount:', enrichedCart.totalDiscount);
    console.log('   - Total:', enrichedCart.total);
    console.log('   - First item current price:', enrichedCart.items[0].currentPrice);
    console.log('   - First item stock:', enrichedCart.items[0].stock);
    console.log('   - First item available:', enrichedCart.items[0].available);

    // 6. Test Create Order
    console.log('\n🧪 TEST 4: Creating Order from Cart...');
    
    const orderNumber = await Order.generateOrderNumber();
    console.log('- Generated order number:', orderNumber);

    const totalAmount = newCart.items.reduce((sum, item) => 
      sum + (item.productSnapshot.price * item.quantity), 0
    );

    const newOrder = new Order({
      orderNumber,
      user: {
        userId: user._id,
        username: user.username
      },
      items: newCart.items.map(item => ({
        productId: item.productId,
        productSnapshot: {
          name: item.productSnapshot.name,
          price: item.productSnapshot.price,
          category: item.productSnapshot.category,
          description: product.description,
          imageUrl: item.productSnapshot.imageUrl,
          brand: item.productSnapshot.brand,
          specifications: product.specifications
        },
        quantity: item.quantity,
        priceAtPurchase: item.productSnapshot.price,
        subtotal: item.productSnapshot.price * item.quantity
      })),
      totalAmount: totalAmount,
      totalDiscount: 0,
      finalAmount: totalAmount,
      shippingAddress: {
        fullName: 'Nguyễn Văn Test',
        phone: '0901234567',
        address: '123 Nguyễn Văn Cừ',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 5',
        ward: 'Phường 4',
        zipCode: '700000'
      },
      paymentMethod: 'cash',
      notes: 'Test order from script'
    });

    await newOrder.save();
    console.log('✅ Order created with ID:', newOrder._id);
    console.log('   - Order number:', newOrder.orderNumber);
    console.log('   - User:', newOrder.user.username);
    console.log('   - Items:', newOrder.items.length);
    console.log('   - Total amount:', newOrder.totalAmount);
    console.log('   - Final amount:', newOrder.finalAmount);
    console.log('   - Status:', newOrder.status);

    // 7. Verify order in database
    console.log('\n🔍 TEST 5: Verifying Order in Database...');
    const savedOrder = await Order.findById(newOrder._id);
    if (savedOrder) {
      console.log('✅ Order found in database!');
      console.log('   - ID:', savedOrder._id);
      console.log('   - Order Number:', savedOrder.orderNumber);
      console.log('   - Created at:', savedOrder.createdAt);
      console.log('   - Payment status:', savedOrder.paymentStatus);
      console.log('   - First item snapshot:', savedOrder.items[0].productSnapshot.name);
    } else {
      console.log('❌ Order NOT found in database!');
    }

    // 8. Test stock decrease (simulating checkout)
    console.log('\n🧪 TEST 6: Simulating Stock Decrease...');
    const originalStock = product.stock;
    console.log('- Original stock:', originalStock);
    
    product.stock -= newCart.items[0].quantity;
    await product.save();
    console.log('- New stock:', product.stock);
    console.log('✅ Stock decreased by:', newCart.items[0].quantity);

    // Restore stock
    product.stock = originalStock;
    await product.save();
    console.log('- Stock restored to:', product.stock);

    // 9. Final statistics
    console.log('\n📊 FINAL DATABASE STATISTICS:');
    const finalCarts = await Cart.countDocuments();
    const finalOrders = await Order.countDocuments();
    console.log('✅ Total Carts:', finalCarts);
    console.log('✅ Total Orders:', finalOrders);

    // 10. Show all carts
    console.log('\n🛒 ALL CARTS IN DATABASE:');
    const allCarts = await Cart.find().lean();
    allCarts.forEach((cart, index) => {
      console.log(`\nCart ${index + 1}:`);
      console.log('  - ID:', cart._id);
      console.log('  - User ID:', cart.user.userId);
      console.log('  - Username:', cart.user.username);
      console.log('  - Items count:', cart.items.length);
      console.log('  - Created:', cart.createdAt);
    });

    // 11. Show all orders
    console.log('\n📦 ALL ORDERS IN DATABASE:');
    const allOrders = await Order.find().lean();
    allOrders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log('  - ID:', order._id);
      console.log('  - Order Number:', order.orderNumber);
      console.log('  - User:', order.user.username);
      console.log('  - Items count:', order.items.length);
      console.log('  - Total:', order.finalAmount);
      console.log('  - Status:', order.status);
      console.log('  - Created:', order.createdAt);
    });

    console.log('\n✅ ============================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ Cart và Order ĐÃ được lưu vào database!');
    console.log('✅ ============================================\n');

  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('❌ TEST FAILED!');
    console.error('❌ ============================================');
    console.error('Error:', error.message);
    console.error('\nFull error:');
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connection closed');
  }
}

// Run the test
console.log('🚀 Starting Cart & Order Database Test...\n');
testCartAndOrder();
