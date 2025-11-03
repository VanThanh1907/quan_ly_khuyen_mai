# 🛒 Order Management System - NoSQL Features

## 📋 Tổng Quan

Hệ thống quản lý đơn hàng với tính năng **Data Denormalization** - một đặc điểm quan trọng của NoSQL databases.

### 🎯 Tính Năng Chính

1. **Tạo đơn hàng** với tự động snapshot product
2. **Áp dụng khuyến mãi** tự động khi tạo order
3. **Lưu giữ lịch sử** - Order không bị ảnh hưởng khi xóa Product
4. **Quản lý trạng thái** đơn hàng (pending → delivered)
5. **Hoàn lại stock** khi hủy đơn
6. **Thống kê** đơn hàng theo user/admin

## 🚀 Quick Start

### 1. Cài Đặt & Seed Database

```bash
# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

### 2. Test NoSQL Feature

```bash
# Run demo script
node testNoSQLFeature.js
```

Demo này sẽ:
- ✅ Tạo order với product
- 🗑️ Xóa product khỏi database  
- ✅ Order vẫn giữ nguyên thông tin product (SNAPSHOT)

## 📁 File Structure

```
backend/
├── models/
│   ├── Order.js              # 🎯 Order model với denormalized data
│   ├── Product.js
│   ├── Promotion.js
│   └── User.js
├── controllers/
│   └── orderController.js    # Order business logic
├── routes/
│   └── orderRoutes.js        # Order API endpoints
├── seed.js                   # Database seeding với sample orders
├── testNoSQLFeature.js       # 🎯 Demo script
├── NOSQL_DEMO.md            # Chi tiết API & concepts
└── ORDER_README.md          # File này
```

## 🎯 NoSQL Concepts Demonstrated

### 1. Data Denormalization

**SQL Approach (Normalized):**
```sql
Orders Table:        OrderItems Table:
+----------+         +----------+------------+
| order_id |         | order_id | product_id |
| user_id  |         | quantity | price      |
+----------+         +----------+------------+
                            ↓
                    Products Table:
                    +------------+
                    | product_id |
                    | name       |
                    | price      |
                    +------------+
Problem: Xóa product → Mất thông tin trong OrderItems!
```

**NoSQL Approach (Denormalized):**
```javascript
Order Document:
{
  _id: ObjectId,
  orderNumber: "ORD-20251101-0001",
  items: [{
    productId: ObjectId,      // Reference (optional)
    productSnapshot: {        // 🎯 EMBEDDED DATA
      name: "Laptop Dell",
      price: 1299.99,
      category: "Electronics",
      brand: "Dell",
      specifications: {...}
    },
    quantity: 1,
    priceAtPurchase: 974.99
  }]
}

✅ Xóa product → Order vẫn giữ đầy đủ thông tin!
```

### 2. Document Embedding

Thay vì dùng JOIN (SQL), NoSQL embed data trực tiếp:

```javascript
// ❌ SQL: Cần 3 JOINs
SELECT * FROM orders
JOIN order_items ON orders.id = order_items.order_id
JOIN products ON order_items.product_id = products.id
JOIN users ON orders.user_id = users.id

// ✅ NoSQL: 1 query, tất cả data có sẵn
db.orders.findOne({ _id: orderId })
// → Có ngay user info, product info, promotion info
```

### 3. Trade-offs

| Aspect | SQL (Normalized) | NoSQL (Denormalized) |
|--------|------------------|----------------------|
| **Data Consistency** | ✅ Luôn đồng bộ | ⚠️ Có thể không đồng bộ |
| **Query Performance** | ⚠️ Cần JOIN nhiều | ✅ Đọc nhanh, 1 query |
| **Storage** | ✅ Tiết kiệm | ⚠️ Duplicate data |
| **Historical Data** | ⚠️ Khó bảo toàn | ✅ Tự động bảo toàn |
| **Update** | ✅ Update 1 chỗ | ⚠️ Phải update nhiều document |

## 🧪 Testing Scenarios

### Scenario 1: Order với Product còn tồn tại

```bash
# 1. Login
POST /api/auth/login
{ "username": "user", "password": "user123" }

# 2. Tạo order
POST /api/orders
{
  "items": [{ "productId": "...", "quantity": 1 }],
  "shippingAddress": {...}
}

# 3. Xem order
GET /api/orders/:orderId
# → Product exists: true
```

### Scenario 2: Order sau khi xóa Product

```bash
# 1. Xem order ban đầu
GET /api/orders/:orderId
# → Product exists: true

# 2. Admin xóa product
DELETE /api/products/:productId

# 3. Xem order lại
GET /api/orders/:orderId
# → Product exists: false
# → productSnapshot: vẫn còn đầy đủ! 🎯
```

### Scenario 3: Auto-apply Promotion

```bash
# 1. Product có promotion đang active (25% off)

# 2. Tạo order với product đó
POST /api/orders
{
  "items": [{ "productId": "...", "quantity": 1 }]
}

# 3. Response sẽ có:
{
  "items": [{
    "priceAtPurchase": 974.99,  // Đã giảm 25%
    "appliedPromotion": {
      "name": "Black Friday Sale",
      "discountPercentage": 25,
      "discountAmount": 325
    }
  }],
  "totalDiscount": 325
}
```

## 📊 API Reference

### User APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Tạo đơn hàng mới |
| GET | `/api/orders/my-orders` | Lấy danh sách đơn của tôi |
| GET | `/api/orders/my-stats` | Thống kê đơn hàng |
| GET | `/api/orders/:id` | Chi tiết đơn hàng |
| PATCH | `/api/orders/:id/status` | Cập nhật trạng thái |

### Admin APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/admin/all` | Lấy tất cả đơn hàng |
| DELETE | `/api/orders/:id` | Xóa đơn hàng |

Chi tiết request/response xem [NOSQL_DEMO.md](./NOSQL_DEMO.md)

## 🎨 Order Schema Highlights

```javascript
// Order Model features:
{
  orderNumber: String,              // Auto-generated: ORD-YYYYMMDD-0001
  
  user: {                           // Denormalized user info
    userId: ObjectId,
    username: String
  },
  
  items: [{
    productId: ObjectId,            // Reference (optional)
    productSnapshot: {...},         // 🎯 Full product data
    appliedPromotion: {...}         // Promotion at purchase time
  }],
  
  status: String,                   // Order lifecycle
  
  // Methods:
  getTotalItems(),                  // Calculate total quantity
  checkProductsExistence(),         // 🎯 Check if products still exist
  
  // Statics:
  generateOrderNumber()             // Auto order number
}
```

## 💡 Real-World Use Cases

### 1. E-Commerce (Amazon, Shopee)
```javascript
// Customer xem lại đơn hàng 3 năm trước
// Product đã bị xóa nhưng vẫn thấy:
// - Tên sản phẩm đã mua
// - Giá tại thời điểm mua
// - Hình ảnh, mô tả
// → Data Denormalization!
```

### 2. Food Delivery (GrabFood, Gojek)
```javascript
// Nhà hàng thay đổi menu/giá
// Đơn hàng cũ vẫn hiển thị đúng:
// - Món ăn đã đặt
// - Giá tại thời điểm order
// → Historical accuracy!
```

### 3. Booking (Booking.com, Airbnb)
```javascript
// Chủ nhà xóa listing
// Booking history vẫn có:
// - Thông tin phòng
// - Giá tại thời điểm đặt
// - Amenities
// → Data preservation!
```

## 🔧 Advanced Features

### 1. Stock Management
```javascript
// Tự động giảm stock khi tạo order
// Hoàn lại stock khi hủy order
createOrder() → product.stock -= quantity
cancelOrder() → product.stock += quantity
```

### 2. Order Number Generation
```javascript
// Format: ORD-YYYYMMDD-XXXX
// Example: ORD-20251104-0001
Order.generateOrderNumber()
// → Auto-increment trong ngày
```

### 3. Product Existence Check
```javascript
// Method để check xem products trong order còn tồn tại không
const check = await order.checkProductsExistence();
// → [{productName, exists, message}, ...]
```

## 📚 Learning Points

### Khi nào dùng Denormalization?

✅ **Nên dùng:**
- Lịch sử giao dịch (orders, invoices)
- Dữ liệu snapshot (audit logs)
- Read-heavy workloads
- Data cần bảo toàn nguyên vẹn

❌ **Không nên:**
- Real-time data (inventory, stock)
- Frequently updated data
- Master data (users, categories)
- Small reference tables

### SQL vs NoSQL Trade-offs

```javascript
// SQL: Normalized
✅ Data consistency
✅ Single source of truth
✅ Easy updates
❌ Complex queries (JOINs)
❌ Slower reads

// NoSQL: Denormalized  
✅ Fast reads (no JOINs)
✅ Historical data preserved
✅ Schema flexibility
❌ Data duplication
❌ Update complexity
```

## 🎓 Homework Ideas

1. **Thêm Order Rating**: Sau khi delivered, customer có thể rate order
2. **Order Tracking**: Thêm timeline tracking (created → processing → shipped → delivered)
3. **Invoice Generation**: Tạo invoice PDF từ order data
4. **Order Analytics**: Dashboard thống kê revenue, top products
5. **Refund System**: Xử lý hoàn tiền, update order status

## 🐛 Common Issues

### Issue 1: Route Conflict
```javascript
// ❌ Wrong order
router.get('/:id', ...);
router.get('/my-orders', ...);  // Never matched!

// ✅ Correct order
router.get('/my-orders', ...);
router.get('/:id', ...);
```

### Issue 2: Insufficient Stock
```javascript
// Backend tự động check:
if (product.stock < item.quantity) {
  return res.status(400).json({
    message: 'Insufficient stock'
  });
}
```

### Issue 3: Promotion Not Applied
```javascript
// Promotion must be:
// - status: 'active'
// - startDate <= now
// - endDate >= now
// - Product in applicableProducts array
```

## 🎉 Summary

Hệ thống Order này thể hiện:

1. ✅ **Data Denormalization** - NoSQL core concept
2. ✅ **Document Embedding** - Nested data structures  
3. ✅ **Historical Data Preservation** - Orders survive product deletion
4. ✅ **Performance Optimization** - No JOINs needed
5. ✅ **Business Logic** - Stock management, auto-pricing, promotion

**Kết quả:** Một hệ thống e-commerce realistic, production-ready! 🚀

---

**Tài liệu tham khảo:**
- [NOSQL_DEMO.md](./NOSQL_DEMO.md) - Chi tiết API & scenarios
- `testNoSQLFeature.js` - Demo script
- `seed.js` - Sample data

**Test Accounts:**
- Admin: `admin` / `admin123`
- User: `user` / `user123`
