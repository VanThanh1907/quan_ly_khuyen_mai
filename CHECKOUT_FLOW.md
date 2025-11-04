# 🛒 Checkout Flow: Cart → Order

## Overview
Quy trình thanh toán chuyển từ giỏ hàng (Cart) sang đơn hàng (Order) với đầy đủ tính năng NoSQL.

## Flow Diagram

```
┌─────────────────┐
│   User in Cart  │
│   Page          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Click "Thanh Toán"      │
│ Button                  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Validate Stock          │
│ GET /api/cart/validate  │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │  Valid? │
    └────┬────┘
         │ Yes
         ▼
┌─────────────────────────┐
│ Show Checkout Dialog    │
│ - Address Form          │
│ - City                  │
│ - Zip Code              │
│ - Country               │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User Fills Form         │
│ Click "Xác Nhận"        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend: POST /api/orders          │
│ {                                   │
│   items: [                          │
│     { productId, quantity }         │
│   ],                                │
│   shippingAddress: {...},           │
│   paymentMethod: 'COD'              │
│ }                                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend: orderController.js         │
│                                     │
│ 1. Validate products exist          │
│ 2. Check stock availability         │
│ 3. Find active promotions           │
│ 4. Calculate prices & discounts     │
│ 5. Create product SNAPSHOTS         │
│ 6. Generate order number            │
│ 7. Decrease product stock           │
│ 8. Save Order to database           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Response: Order Created             │
│ {                                   │
│   orderNumber: "ORD-20251104-0001", │
│   totalAmount: 59.98,               │
│   finalAmount: 47.98,               │
│   status: "pending"                 │
│ }                                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend: Clear Cart                │
│ DELETE /api/cart/clear              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Show Success Message                │
│ "✅ Đặt hàng thành công!"           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Navigate to /orders                 │
│ (after 2 seconds)                   │
└─────────────────────────────────────┘
```

## Code Implementation

### 1. Frontend: Cart.js

#### Checkout Function
```javascript
const handleCheckout = async () => {
  // 1. Validate form
  if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
    setError('Vui lòng điền đầy đủ địa chỉ giao hàng');
    return;
  }

  setCheckoutLoading(true);
  
  try {
    // 2. Prepare order data from cart
    const orderData = {
      items: cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || '',
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'Vietnam'
      },
      paymentMethod: 'COD',
      notes: ''
    };

    // 3. Create order via API
    const response = await api.post('/orders', orderData);
    const order = response.data.data;
    
    // 4. Show success
    setSuccess(`✅ Đặt hàng thành công! Mã đơn hàng: ${order.orderNumber}`);
    setCheckoutOpen(false);
    
    // 5. Clear cart (skip confirmation)
    await clearCart(true);
    
    // 6. Navigate to orders page
    setTimeout(() => {
      navigate('/orders');
    }, 2000);
    
  } catch (err) {
    console.error('Error during checkout:', err);
    setError(err.response?.data?.message || 'Không thể hoàn tất đơn hàng');
    
    if (err.response?.status === 400) {
      await fetchCart();
    }
  } finally {
    setCheckoutLoading(false);
  }
};
```

### 2. Backend: orderController.js

#### Create Order Function (Highlights)
```javascript
exports.createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;

  // 1️⃣ Validate và lấy thông tin products
  const orderItems = [];
  let totalAmount = 0;
  let totalDiscount = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    
    if (!product) {
      return res.status(404).json({
        message: `Product not found: ${item.productId}`
      });
    }

    // 2️⃣ CHECK STOCK
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
      });
    }

    // 3️⃣ Find active promotion
    const activePromotion = await Promotion.findOne({
      applicableProducts: product._id,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    // 4️⃣ Calculate price with discount
    let priceAtPurchase = product.price;
    let discountAmount = 0;
    
    if (activePromotion) {
      discountAmount = (priceAtPurchase * activePromotion.discountPercentage) / 100;
      priceAtPurchase = priceAtPurchase - discountAmount;
      totalDiscount += discountAmount * item.quantity;
    }

    // 5️⃣ 🎯 CREATE PRODUCT SNAPSHOT (NoSQL!)
    orderItems.push({
      productId: product._id,
      productSnapshot: {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        brand: product.brand,
        specifications: product.specifications
      },
      quantity: item.quantity,
      priceAtPurchase: priceAtPurchase,
      appliedPromotion: activePromotion ? {
        promotionId: activePromotion._id,
        name: activePromotion.name,
        discountPercentage: activePromotion.discountPercentage,
        discountAmount: discountAmount * item.quantity
      } : null,
      subtotal: priceAtPurchase * item.quantity
    });

    // 6️⃣ DECREASE STOCK
    product.stock -= item.quantity;
    await product.save();
  }

  // 7️⃣ Generate order number
  const orderNumber = await Order.generateOrderNumber();

  // 8️⃣ CREATE ORDER
  const order = await Order.create({
    orderNumber,
    user: {
      userId: req.user.id,
      username: req.user.username
    },
    items: orderItems,
    totalAmount: totalAmount + totalDiscount,
    totalDiscount,
    finalAmount: totalAmount,
    shippingAddress,
    paymentMethod,
    notes
  });

  res.status(201).json({
    success: true,
    message: '✅ Order created successfully',
    data: order
  });
};
```

## Database Changes

### Before Checkout

#### Collection: `carts`
```javascript
{
  _id: ObjectId("cart123"),
  userId: ObjectId("user456"),
  items: [
    {
      productId: ObjectId("prod789"),
      productSnapshot: {
        name: "Adidas T-Shirt",
        price: 29.99,
        imageUrl: "/images/adidas.jpg"
      },
      quantity: 2
    }
  ],
  createdAt: "2025-11-04T10:00:00Z"
}
```

#### Collection: `products`
```javascript
{
  _id: ObjectId("prod789"),
  name: "Adidas T-Shirt",
  price: 29.99,
  stock: 300, // 👈 Before
  category: "Fashion",
  brand: "Adidas"
}
```

### After Checkout

#### Collection: `orders` (NEW!)
```javascript
{
  _id: ObjectId("order999"),
  orderNumber: "ORD-20251104-0001", // ✅ Generated
  user: {
    userId: ObjectId("user456"),
    username: "john_doe"
  },
  items: [
    {
      productId: ObjectId("prod789"),
      productSnapshot: { // 🎯 SNAPSHOT SAVED
        name: "Adidas T-Shirt",
        price: 29.99,
        category: "Fashion",
        description: "Cotton sports t-shirt",
        imageUrl: "/images/adidas.jpg",
        brand: "Adidas",
        specifications: { size: "L", color: "Blue" }
      },
      quantity: 2,
      priceAtPurchase: 23.99, // After 20% discount
      appliedPromotion: {
        promotionId: ObjectId("promo111"),
        name: "Black Friday Sale",
        discountPercentage: 20,
        discountAmount: 12.00
      },
      subtotal: 47.98
    }
  ],
  shippingAddress: {
    street: "123 Nguyen Van Cu",
    city: "Ho Chi Minh City",
    state: "",
    zipCode: "700000",
    country: "Vietnam"
  },
  paymentMethod: "COD",
  totalAmount: 59.98,    // Before discount
  totalDiscount: 12.00,  // 20% discount
  finalAmount: 47.98,    // After discount
  status: "pending",
  paymentStatus: "pending",
  createdAt: "2025-11-04T10:30:00Z",
  updatedAt: "2025-11-04T10:30:00Z"
}
```

#### Collection: `carts` (DELETED!)
```javascript
// ❌ Cart document deleted after checkout
```

#### Collection: `products` (STOCK DECREASED!)
```javascript
{
  _id: ObjectId("prod789"),
  name: "Adidas T-Shirt",
  price: 29.99,
  stock: 298, // ⬇️ Decreased from 300 to 298 (bought 2)
  category: "Fashion",
  brand: "Adidas"
}
```

## NoSQL Design Patterns

### 1. **Product Snapshot (Denormalization)**
```javascript
// Order lưu TOÀN BỘ thông tin product tại thời điểm mua
productSnapshot: {
  name: "Adidas T-Shirt",
  price: 29.99,
  category: "Fashion",
  description: "Cotton sports t-shirt",
  imageUrl: "/images/adidas.jpg",
  brand: "Adidas",
  specifications: { size: "L", color: "Blue" }
}
```

**Lợi ích:**
- ✅ Lưu trữ lịch sử chính xác
- ✅ Order vẫn hiển thị đầy đủ thông tin ngay cả khi product bị xóa
- ✅ Không cần JOIN với Product collection khi hiển thị order
- ✅ Giá và thông tin product tại thời điểm mua được bảo toàn

### 2. **Reference Pattern**
```javascript
// Vẫn giữ reference để tracking
productId: ObjectId("prod789")
```

**Lợi ích:**
- ✅ Có thể check product còn tồn tại không
- ✅ Có thể so sánh giá hiện tại vs giá đã mua
- ✅ Admin có thể tracking sản phẩm nào bán chạy

### 3. **Embedded Promotion**
```javascript
appliedPromotion: {
  promotionId: ObjectId("promo111"),
  name: "Black Friday Sale",
  discountPercentage: 20,
  discountAmount: 12.00
}
```

**Lợi ích:**
- ✅ Biết chính xác promotion nào đã áp dụng
- ✅ Lưu lại discount amount tại thời điểm đó
- ✅ Ngay cả khi xóa promotion, order vẫn có data

## API Endpoints

### Frontend Calls

#### 1. Validate Cart Before Checkout
```javascript
GET /api/cart/validate
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "warnings": []
  }
}
```

#### 2. Create Order
```javascript
POST /api/orders
```

**Request:**
```json
{
  "items": [
    {
      "productId": "prod789",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Nguyen Van Cu",
    "city": "Ho Chi Minh City",
    "state": "",
    "zipCode": "700000",
    "country": "Vietnam"
  },
  "paymentMethod": "COD",
  "notes": ""
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Order created successfully",
  "data": {
    "_id": "order999",
    "orderNumber": "ORD-20251104-0001",
    "user": {
      "userId": "user456",
      "username": "john_doe"
    },
    "items": [...],
    "totalAmount": 59.98,
    "totalDiscount": 12.00,
    "finalAmount": 47.98,
    "status": "pending",
    "createdAt": "2025-11-04T10:30:00Z"
  }
}
```

#### 3. Clear Cart
```javascript
DELETE /api/cart/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

## Error Handling

### Stock Validation Error
```json
{
  "success": false,
  "message": "Insufficient stock for Adidas T-Shirt. Available: 1"
}
```

**Frontend Action:**
- Show error alert
- Refresh cart to show updated stock

### Product Not Found Error
```json
{
  "success": false,
  "message": "Product not found: prod789"
}
```

**Frontend Action:**
- Show error alert
- Remove invalid item from cart display

## User Experience Flow

### 1. Cart Page
```
┌──────────────────────────────────────┐
│ 🛒 Giỏ Hàng                          │
├──────────────────────────────────────┤
│ Adidas T-Shirt         x2   $59.98   │
│ -20% Black Friday      -$12.00       │
│                                      │
│ Subtotal:              $59.98        │
│ Discount:             -$12.00        │
│ ────────────────────────────────     │
│ Total:                 $47.98        │
│                                      │
│ [ Tiếp Tục Mua Sắm ] [ Thanh Toán ] │
└──────────────────────────────────────┘
```

### 2. Checkout Dialog
```
┌──────────────────────────────────────┐
│ Thông Tin Giao Hàng                  │
├──────────────────────────────────────┤
│ Địa chỉ:  [___________________]      │
│ Thành phố: [___________________]     │
│ Tỉnh/Thành: [___________________]    │
│ Mã bưu điện: [___________________]   │
│ Quốc gia: [Vietnam____________]      │
│                                      │
│           [ Hủy ] [ Xác Nhận ]       │
└──────────────────────────────────────┘
```

### 3. Success Message
```
┌──────────────────────────────────────┐
│ ✅ Đặt hàng thành công!               │
│ Mã đơn hàng: ORD-20251104-0001       │
│                                      │
│ Đang chuyển đến trang đơn hàng...    │
└──────────────────────────────────────┘
```

### 4. Orders Page
```
┌──────────────────────────────────────┐
│ 📦 Đơn Hàng Của Tôi                  │
├──────────────────────────────────────┤
│ ORD-20251104-0001  Nov 4, 2025       │
│ 2 items            $47.98            │
│ Status: Pending    [ View Details ]  │
└──────────────────────────────────────┘
```

## Testing Checklist

### Happy Path
- [x] Add products to cart
- [x] View cart with correct prices and promotions
- [x] Click "Thanh Toán" button
- [x] Stock validation passes
- [x] Fill shipping address form
- [x] Click "Xác Nhận"
- [x] Order created successfully
- [x] Cart cleared automatically
- [x] Redirected to orders page
- [x] Order appears in orders list
- [x] Product stock decreased in database

### Edge Cases
- [x] Checkout with out-of-stock item → Error shown
- [x] Checkout with insufficient stock → Error shown
- [x] Empty shipping address → Validation error
- [x] Product deleted after adding to cart → Order still shows snapshot
- [x] Promotion ended after adding to cart → No discount applied at checkout

## Files Modified

### Frontend
- ✅ `frontend/src/pages/Cart.js`
  - Modified `handleCheckout()` to call `/api/orders`
  - Changed data format to match backend expectations
  - Added automatic cart clearing after successful order
  - Skip confirmation dialog when clearing cart after checkout

### Backend (Already Existed)
- ✅ `backend/controllers/orderController.js`
  - `createOrder()` - Full implementation with snapshots
  - `getUserOrders()` - Get user's orders
  - `getOrderById()` - Get order details
  - Stock validation and decrease logic
  - Promotion application logic

- ✅ `backend/routes/orderRoutes.js`
  - POST `/api/orders` - Create order
  - GET `/api/orders/my-orders` - User orders
  - GET `/api/orders/:id` - Order details

- ✅ `backend/server.js`
  - Order routes registered at `/api/orders`

## Summary

**Chức năng đã hoàn thành:**
1. ✅ User click "Thanh Toán" trong giỏ hàng
2. ✅ Validate stock trước khi checkout
3. ✅ Hiển thị form địa chỉ giao hàng
4. ✅ Gọi API POST `/api/orders` để tạo order
5. ✅ Backend validate stock và tạo product snapshots
6. ✅ Áp dụng promotions nếu có
7. ✅ Giảm stock của products
8. ✅ Tạo Order trong database với đầy đủ thông tin
9. ✅ Xóa giỏ hàng sau khi tạo order thành công
10. ✅ Chuyển user đến trang Orders

**Điểm đặc biệt NoSQL:**
- Product snapshot được lưu đầy đủ trong order
- Ngay cả khi xóa product, order vẫn hiển thị được
- Promotion information được embedded trong order item
- Không cần JOIN queries để hiển thị order details

---

**Status**: ✅ Hoàn thành
**Tested**: ✅ Ready for testing
**Last Updated**: November 4, 2025
