/**
 * 🎯 Script Demo Tính Chất NoSQL
 * Chạy: node testNoSQLFeature.js
 * 
 * Demo: Khi xóa Product, Order vẫn giữ nguyên thông tin (Data Denormalization)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

const testNoSQLFeature = async () => {
  try {
    console.log('🚀 Starting NoSQL Feature Demo...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1️⃣ Tìm một order có sẵn
    const order = await Order.findOne().populate('user.userId');
    
    if (!order) {
      console.log('❌ No orders found. Please run: npm run seed');
      process.exit(1);
    }

    console.log('📦 Found Order:', order.orderNumber);
    console.log('👤 User:', order.user.username);
    console.log('📋 Number of items:', order.items.length);
    console.log('💰 Total amount:', order.finalAmount);
    console.log('\n--- Order Items ---');
    
    // 2️⃣ Hiển thị items trong order
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      console.log(`\nItem ${i + 1}:`);
      console.log(`  Product ID: ${item.productId}`);
      console.log(`  📸 Snapshot Name: ${item.productSnapshot.name}`);
      console.log(`  💵 Snapshot Price: $${item.productSnapshot.price}`);
      console.log(`  🔖 Category: ${item.productSnapshot.category}`);
      console.log(`  🏷️ Brand: ${item.productSnapshot.brand}`);
      console.log(`  📦 Quantity: ${item.quantity}`);
      
      // Kiểm tra product còn tồn tại không
      const productExists = await Product.exists({ _id: item.productId });
      console.log(`  ✅ Product exists in DB: ${productExists ? 'YES' : 'NO'}`);
    }

    console.log('\n\n🎯 ===== DEMO NoSQL FEATURE ===== 🎯');
    console.log('Now we will DELETE the first product from the database...\n');

    // 3️⃣ Xóa product đầu tiên
    const firstItem = order.items[0];
    const productToDelete = await Product.findById(firstItem.productId);
    
    if (!productToDelete) {
      console.log('⚠️ Product already deleted. Skipping deletion step.');
    } else {
      console.log(`🗑️ Deleting product: ${productToDelete.name} (ID: ${productToDelete._id})`);
      await Product.findByIdAndDelete(firstItem.productId);
      console.log('✅ Product deleted from database!\n');
    }

    // 4️⃣ Kiểm tra lại order
    console.log('🔍 Checking order again after product deletion...\n');
    
    const orderAfterDeletion = await Order.findById(order._id);
    const deletedItem = orderAfterDeletion.items[0];
    
    console.log('📦 Order still exists!');
    console.log('📋 Order Number:', orderAfterDeletion.orderNumber);
    console.log('\n--- Item Information (After Product Deletion) ---');
    console.log(`  Product ID: ${deletedItem.productId}`);
    console.log(`  📸 Snapshot Name: ${deletedItem.productSnapshot.name}`);
    console.log(`  💵 Snapshot Price: $${deletedItem.productSnapshot.price}`);
    console.log(`  🔖 Category: ${deletedItem.productSnapshot.category}`);
    console.log(`  🏷️ Brand: ${deletedItem.productSnapshot.brand}`);
    
    // Kiểm tra lại product
    const stillExists = await Product.exists({ _id: deletedItem.productId });
    console.log(`  ❌ Product exists in DB: ${stillExists ? 'YES' : 'NO'}`);
    
    console.log('\n✨ ===== RESULT ===== ✨');
    console.log('🎯 Even though the Product was DELETED from the database,');
    console.log('   the Order still contains ALL the product information!');
    console.log('\n📚 This demonstrates the NoSQL concept of:');
    console.log('   📌 DATA DENORMALIZATION');
    console.log('   📌 EMBEDDING DOCUMENTS');
    console.log('   📌 PRESERVING HISTORICAL DATA');
    
    console.log('\n💡 Use Case: E-commerce Order History');
    console.log('   - When a product is discontinued/deleted');
    console.log('   - Order history remains intact');
    console.log('   - Customers can still see what they purchased');
    console.log('   - Business can still track historical sales');

    console.log('\n⚖️ Trade-off:');
    console.log('   ✅ Pros: Data integrity, Historical accuracy');
    console.log('   ⚠️ Cons: Data duplication, Potential inconsistency');

    // 5️⃣ Test method checkProductsExistence
    console.log('\n\n🔍 Testing checkProductsExistence() method...');
    const existenceCheck = await orderAfterDeletion.checkProductsExistence();
    
    console.log('\n--- Product Existence Check ---');
    existenceCheck.forEach((check, index) => {
      console.log(`\nProduct ${index + 1}:`);
      console.log(`  Name: ${check.productName}`);
      console.log(`  Exists: ${check.exists ? '✅ YES' : '❌ NO'}`);
      console.log(`  Message: ${check.message}`);
    });

    console.log('\n\n✅ Demo completed successfully!');
    console.log('💾 Database state:');
    console.log('   - Order: Still exists with full data');
    console.log('   - Product: Deleted from database');
    console.log('   - Order\'s product snapshot: Intact! 🎯');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the demo
testNoSQLFeature();
