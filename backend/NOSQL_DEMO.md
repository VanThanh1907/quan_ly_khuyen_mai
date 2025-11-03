# 🎯 Demo Tính Chất NoSQL - Order System

## Tính Năng Đã Triển Khai

### 1. **Data Denormalization** (Phi chuẩn hóa dữ liệu)
- Order lưu trữ **SNAPSHOT** đầy đủ của Product tại thời điểm mua hàng
- Không chỉ lưu reference (productId) mà lưu cả thông tin chi tiết
- Khi Product bị xóa, Order vẫn giữ nguyên thông tin sản phẩm

### 2. **Trade-off của NoSQL**
- ✅ **Ưu điểm**: Lịch sử đơn hàng luôn chính xác, không bị ảnh hưởng khi xóa/sửa product
- ⚠️ **Nhược điểm**: Dữ liệu có thể không đồng bộ (giá/thông tin product thay đổi không cập nhật vào order cũ)
- 💡 **Phù hợp**: Hệ thống thương mại điện tử cần lưu giữ lịch sử chính xác

## Cấu Trúc Order Document

```json
{
  "orderNumber": "ORD-20251101-0001",
  "user": {
    "userId": ObjectId,
    "username": "user"  // Denormalized
  },
  "items": [{
    "productId": ObjectId,  // Reference (có thể null nếu product bị xóa)
    "productSnapshot": {    // 🎯 SNAPSHOT - Data Denormalization
      "name": "Laptop Dell XPS 15",
      "price": 1299.99,
      "category": "Electronics",
      "description": "High-performance laptop",
      "imageUrl": "/images/products/laptop-dell.jpg",
      "brand": "Dell",
      "specifications": {...}
    },
    "quantity": 1,
    "priceAtPurchase": 974.99,  // Giá đã áp dụng khuyến mãi
    "appliedPromotion": {       // Thông tin khuyến mãi
      "promotionId": ObjectId,
      "name": "Black Friday Sale",
      "discountPercentage": 25,
      "discountAmount": 325
    },
    "subtotal": 974.99
  }],
  "totalAmount": 1374.97,
  "totalDiscount": 350,
  "finalAmount": 1049.97,
  "status": "delivered"
}
```

## API Endpoints

### User Endpoints

#### 1. Tạo đơn hàng mới
```http
POST /api/orders
Authorization: Bearer <token>

{
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "address": "123 Đường ABC",
    "city": "TP.HCM",
    "district": "Quận 1",
    "ward": "Phường 1"
  },
  "paymentMethod": "credit_card",
  "notes": "Giao hàng giờ hành chính"
}
```

#### 2. Lấy đơn hàng của tôi
```http
GET /api/orders/my-orders?page=1&limit=10&status=delivered
Authorization: Bearer <token>
```

#### 3. Thống kê đơn hàng của tôi
```http
GET /api/orders/my-stats
Authorization: Bearer <token>
```

#### 4. Chi tiết đơn hàng
```http
GET /api/orders/:orderId
Authorization: Bearer <token>

Response bao gồm:
- Thông tin đơn hàng đầy đủ
- productExistence: Danh sách check xem product còn tồn tại không
```

#### 5. Cập nhật trạng thái (Hủy đơn)
```http
PATCH /api/orders/:orderId/status
Authorization: Bearer <token>

{
  "status": "cancelled"
}

Note: Khi hủy, stock sẽ được hoàn lại
```

### Admin Endpoints

#### 1. Lấy tất cả đơn hàng
```http
GET /api/orders/admin/all?page=1&limit=10&status=pending
Authorization: Bearer <admin_token>

Query params:
- page: Trang hiện tại
- limit: Số lượng/trang
- status: Lọc theo trạng thái
- startDate: Từ ngày
- endDate: Đến ngày
```

#### 2. Xóa đơn hàng
```http
DELETE /api/orders/:orderId
Authorization: Bearer <admin_token>
```

## Demo Tính Chất NoSQL

### Scenario 1: Tạo Order và Xóa Product

1. **Đăng nhập**
```bash
POST /api/auth/login
{
  "username": "user",
  "password": "user123"
}
```

2. **Tạo đơn hàng**
```bash
POST /api/orders
{
  "items": [
    {
      "productId": "673a...",  # ID của Laptop Dell
      "quantity": 1
    }
  ],
  "shippingAddress": {...},
  "paymentMethod": "credit_card"
}
```

3. **Xóa Product (Admin)**
```bash
DELETE /api/products/673a...
```

4. **Kiểm tra Order lại**
```bash
GET /api/orders/:orderId

# Response sẽ có:
{
  "data": {
    "items": [{
      "productId": "673a...",  # Có thể null
      "productSnapshot": {     # ✅ VẪN CÒN đầy đủ thông tin!
        "name": "Laptop Dell XPS 15",
        "price": 1299.99,
        ...
      }
    }]
  },
  "productExistence": [
    {
      "productId": "673a...",
      "productName": "Laptop Dell XPS 15",
      "exists": false,  # ⚠️ Product đã bị xóa
      "message": "⚠️ Product has been deleted"
    }
  ]
}
```

### Scenario 2: Order với Promotion

1. **Tạo order khi product đang có khuyến mãi**
   - Hệ thống tự động áp dụng promotion
   - Lưu thông tin promotion vào order

2. **Xóa Promotion**
   - Order vẫn giữ thông tin discount đã áp dụng
   - Lịch sử giá giảm không bị mất

### Scenario 3: Thay Đổi Giá Product

1. **Tạo order với giá hiện tại**
2. **Admin thay đổi giá product**
3. **Order cũ vẫn giữ giá cũ** (priceAtPurchase)
   - Đảm bảo tính chính xác lịch sử giao dịch
   - Không cần lo khách hàng khiếu nại về giá

## Testing Commands

### 1. Seed Database
```bash
npm run seed
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test với Postman/Thunder Client

#### Login
```
POST http://localhost:5000/api/auth/login
Body: { "username": "user", "password": "user123" }
```

#### Create Order
```
POST http://localhost:5000/api/orders
Headers: Authorization: Bearer <token>
Body: { ... }
```

#### Get My Orders
```
GET http://localhost:5000/api/orders/my-orders
Headers: Authorization: Bearer <token>
```

#### Get Order Detail (Check Product Existence)
```
GET http://localhost:5000/api/orders/:orderId
Headers: Authorization: Bearer <token>
```

## So Sánh SQL vs NoSQL

### SQL (Normalized)
```sql
-- Orders table
order_id | user_id | total | created_at

-- OrderItems table
item_id | order_id | product_id | quantity | price

-- Products table
product_id | name | price | ...

-- Problem: Nếu xóa product, order_items mất thông tin!
-- Solution: Thêm constraint ON DELETE RESTRICT (không cho xóa)
```

### NoSQL (Denormalized)
```javascript
// Order document
{
  _id: ObjectId,
  user: { userId, username },  // Embedded user info
  items: [{
    productId: ObjectId,        // Reference
    productSnapshot: {          // Embedded product info
      name, price, category, ... 
    },
    quantity, subtotal
  }],
  totalAmount, finalAmount
}

// Advantage: Xóa product không ảnh hưởng đến order history!
// Trade-off: Dữ liệu có thể không đồng bộ
```

## Kết Luận

🎯 **Tính chất NoSQL được thể hiện qua:**

1. **Document Embedding**: Lưu toàn bộ thông tin product vào order
2. **Denormalization**: Chấp nhận duplicate data để tăng performance và bảo toàn lịch sử
3. **Flexible Schema**: Có thể thêm/bớt field dễ dàng (specifications, notes, etc.)
4. **Trade-off Awareness**: Hiểu rõ ưu/nhược điểm của việc denormalize

💡 **Use Case thực tế:**
- E-commerce: Amazon, Shopee, Lazada đều lưu snapshot của product trong order
- Booking: Giữ thông tin phòng/khách sạn tại thời điểm đặt
- Food Delivery: Lưu menu item details khi đặt hàng

✅ **Best Practice:**
- Lưu snapshot cho dữ liệu lịch sử (order, invoice)
- Sử dụng reference cho dữ liệu cần real-time (inventory)
- Cân nhắc giữa consistency và availability
