const mongoose = require('mongoose');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
require('dotenv').config();

async function viewData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/promotion_management');
    console.log('✅ Connected to MongoDB\n');

    console.log('==========================================');
    console.log('🛒 ALL CARTS IN DATABASE');
    console.log('==========================================\n');
    
    const carts = await Cart.find().lean();
    console.log(`Total Carts: ${carts.length}\n`);
    
    carts.forEach((cart, index) => {
      console.log(`Cart ${index + 1}:`);
      console.log(`  ID: ${cart._id}`);
      console.log(`  User: ${cart.user.username} (${cart.user.userId})`);
      console.log(`  Items: ${cart.items.length}`);
      cart.items.forEach((item, i) => {
        console.log(`    ${i + 1}. ${item.productSnapshot.name}`);
        console.log(`       - Quantity: ${item.quantity}`);
        console.log(`       - Price: $${item.productSnapshot.price}`);
      });
      console.log(`  Created: ${cart.createdAt}`);
      console.log(`  Expires: ${cart.expiresAt}`);
      console.log('');
    });

    console.log('==========================================');
    console.log('📦 ALL ORDERS IN DATABASE');
    console.log('==========================================\n');
    
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    console.log(`Total Orders: ${orders.length}\n`);
    
    orders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Order Number: ${order.orderNumber}`);
      console.log(`  User: ${order.user.username} (${order.user.userId})`);
      console.log(`  Items: ${order.items.length}`);
      order.items.forEach((item, i) => {
        console.log(`    ${i + 1}. ${item.productSnapshot.name}`);
        console.log(`       - Quantity: ${item.quantity}`);
        console.log(`       - Price at purchase: $${item.priceAtPurchase}`);
        console.log(`       - Subtotal: $${item.subtotal}`);
      });
      console.log(`  Total Amount: $${order.totalAmount}`);
      console.log(`  Discount: $${order.totalDiscount}`);
      console.log(`  Final Amount: $${order.finalAmount}`);
      console.log(`  Status: ${order.status}`);
      console.log(`  Payment: ${order.paymentMethod} (${order.paymentStatus})`);
      console.log(`  Shipping: ${order.shippingAddress.fullName}`);
      console.log(`           ${order.shippingAddress.address}`);
      console.log(`           ${order.shippingAddress.city}`);
      console.log(`  Created: ${order.createdAt}`);
      console.log('');
    });

    console.log('==========================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

viewData();
